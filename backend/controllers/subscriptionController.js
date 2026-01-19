import asyncHandler from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.js';
import Subscription from '../models/Subscription.js';

const ACTIVE_STATUSES = ['pending', 'active', 'scheduled'];

const recalcDeliveryProgress = (subscription) => {
  if (!Array.isArray(subscription.deliveries)) {
    subscription.deliveries = [];
  }

  const deliveredCount = subscription.deliveries.filter((delivery) => delivery.status === 'delivered').length;
  subscription.deliveredDays = deliveredCount;

  if (deliveredCount >= (subscription.totalDays || subscription.deliveries.length || 0)) {
    subscription.status = 'completed';
  } else if (!['paused', 'cancelled'].includes(subscription.status)) {
    subscription.status = 'active';
  }

  const nextPendingIndex = subscription.deliveries.findIndex((delivery) => delivery.status !== 'delivered');
  if (nextPendingIndex !== -1 && subscription.deliveries[nextPendingIndex].status === 'upcoming') {
    subscription.deliveries[nextPendingIndex].status = 'scheduled';
  }

  if (deliveredCount > 0) {
    subscription.lastDeliveryDate = new Date();
  }
};

const normalizeDate = (input) => {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  // Normalize to start of day for consistency
  date.setHours(0, 0, 0, 0);
  return date;
};

const validatePreferences = (preferences = {}) => {
  const errors = [];
  const dietType = preferences.dietType?.toLowerCase();
  const spiceLevel = preferences.spiceLevel?.toLowerCase();
  const deliveryTime = preferences.deliveryTime?.toLowerCase();

  if (!['veg', 'non-veg'].includes(dietType)) {
    errors.push('dietType must be veg or non-veg');
  }

  if (!['mild', 'medium', 'spicy'].includes(spiceLevel)) {
    errors.push('spiceLevel must be mild, medium, or spicy');
  }

  if (!['breakfast', 'lunch', 'dinner'].includes(deliveryTime)) {
    errors.push('deliveryTime must be breakfast, lunch, or dinner');
  }

  return {
    isValid: errors.length === 0,
    errors,
    values: { dietType, spiceLevel, deliveryTime },
  };
};

export const getMySubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({ user: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  if (!subscription) {
    return sendResponse(res, 404, false, 'No subscription found for this account');
  }

  return sendResponse(res, 200, true, 'Subscription fetched successfully', subscription);
});

export const createSubscription = asyncHandler(async (req, res) => {
  const { plan = 'weekly', startDate, preferences = {}, paymentMethod = 'cod' } = req.body;

  if (plan !== 'weekly') {
    return sendResponse(res, 400, false, 'Only the weekly plan is currently supported');
  }

  if (paymentMethod !== 'cod') {
    return sendResponse(res, 400, false, 'Only Cash on Delivery is supported for subscriptions');
  }

  if (req.user?.phoneVerified === false) {
    return sendResponse(res, 400, false, 'Please verify your phone number before subscribing');
  }

  const activeSubscription = await Subscription.findOne({
    user: req.user._id,
    status: { $in: ACTIVE_STATUSES },
  });

  if (activeSubscription) {
    return sendResponse(res, 400, false, 'You already have an active subscription');
  }

  const normalizedStartDate = normalizeDate(startDate || new Date());

  if (!normalizedStartDate) {
    return sendResponse(res, 400, false, 'Invalid start date');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (normalizedStartDate < today) {
    return sendResponse(res, 400, false, 'Start date must be today or later');
  }

  const { isValid, errors, values } = validatePreferences(preferences);

  if (!isValid) {
    return sendResponse(res, 400, false, errors.join(', '));
  }

  const subscription = new Subscription({
    user: req.user._id,
    plan: 'weekly',
    status: normalizedStartDate.getTime() === today.getTime() ? 'active' : 'scheduled',
    paymentMethod: 'cod',
    startDate: normalizedStartDate,
    totalDays: 7,
    preferences: values,
  });

  await subscription.save();

  const response = subscription.toObject();

  return sendResponse(res, 201, true, 'Subscription created successfully', response);
});

export const getAllSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find()
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 })
    .lean();

  return sendResponse(res, 200, true, 'Subscriptions fetched successfully', subscriptions);
});

export const markDeliveryDelivered = asyncHandler(async (req, res) => {
  const { subscriptionId, dayIndex } = req.params;

  const index = Number(dayIndex);

  if (Number.isNaN(index) || index < 0) {
    return sendResponse(res, 400, false, 'Invalid delivery index');
  }

  const subscription = await Subscription.findById(subscriptionId).populate('user', 'name email phone');

  if (!subscription) {
    return sendResponse(res, 404, false, 'Subscription not found');
  }

  if (!Array.isArray(subscription.deliveries) || index >= subscription.deliveries.length) {
    return sendResponse(res, 400, false, 'Delivery not found for the given index');
  }

  const delivery = subscription.deliveries[index];

  if (delivery.status === 'delivered') {
    recalcDeliveryProgress(subscription);
    await subscription.save();
    await subscription.populate('user', 'name email phone');
    return sendResponse(res, 200, true, 'Delivery already marked as delivered', subscription);
  }

  delivery.status = 'delivered';
  delivery.notes = delivery.notes || '';

  recalcDeliveryProgress(subscription);

  await subscription.save();
  await subscription.populate('user', 'name email phone');

  return sendResponse(res, 200, true, `Delivery ${index + 1} marked as delivered`, subscription);
});
