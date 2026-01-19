import Service from '../models/Service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.js';

// @desc    Get all active services/items
// @route   GET /api/services
// @access  Public
export const getServices = asyncHandler(async (req, res) => {
  const { mealType } = req.query;

  const filter = { isActive: true };

  if (mealType) {
    const normalizedMealType = mealType.toLowerCase();
    if (!['breakfast', 'lunch', 'dinner'].includes(normalizedMealType)) {
      return sendResponse(res, 400, false, 'Invalid meal type. Use breakfast, lunch, or dinner.');
    }
    filter.mealType = normalizedMealType;
  }

  const services = await Service.find(filter).sort({ createdAt: -1 });

  return sendResponse(res, 200, true, 'Services fetched successfully', services);
});

// @desc    Create a new service/item (admin only)
// @route   POST /api/services
// @access  Private/Admin
export const createService = asyncHandler(async (req, res) => {
  const { title, description, category, type, price, duration, imageUrl, isActive, mealType } = req.body;

  if (mealType && !['breakfast', 'lunch', 'dinner'].includes(mealType.toLowerCase())) {
    return sendResponse(res, 400, false, 'Invalid meal type. Use breakfast, lunch, or dinner.');
  }

  const service = await Service.create({
    title,
    description,
    category,
    type,
    price,
    duration,
    imageUrl,
    isActive,
    ...(mealType && { mealType: mealType.toLowerCase() }),
  });

  return sendResponse(res, 201, true, 'Service created successfully', service);
});

// @desc    Update a service/item (admin only)
// @route   PUT /api/services/:id
// @access  Private/Admin
export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return sendResponse(res, 404, false, 'Service not found');
  }

  if (req.body.mealType && !['breakfast', 'lunch', 'dinner'].includes(req.body.mealType.toLowerCase())) {
    return sendResponse(res, 400, false, 'Invalid meal type. Use breakfast, lunch, or dinner.');
  }

  Object.assign(service, {
    ...req.body,
    ...(req.body.mealType && { mealType: req.body.mealType.toLowerCase() }),
  });

  const updatedService = await service.save();

  return sendResponse(res, 200, true, 'Service updated successfully', updatedService);
});

// @desc    Delete a service/item (admin only)
// @route   DELETE /api/services/:id
// @access  Private/Admin
export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return sendResponse(res, 404, false, 'Service not found');
  }

  await service.deleteOne();

  return sendResponse(res, 200, true, 'Service deleted successfully');
});
