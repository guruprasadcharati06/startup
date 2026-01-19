import fetch from 'node-fetch';
import Order from '../models/Order.js';
import Service from '../models/Service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.js';
import {
  calculateDeliveryFee,
  calculateDistanceKm,
  getStoreCoordinates,
} from '../utils/distance.js';

// @desc    Validate delivery address using OpenStreetMap and calculate distance/fee
// @route   POST /api/orders/estimate-delivery
// @access  Private
const geocodeAddress = async (query) => {
  const userAgent = process.env.NOMINATIM_USER_AGENT || 'ServeShopApp/1.0 (support@serveshop.local)';
  const contactEmail = process.env.NOMINATIM_EMAIL;

  const providers = [
    () => {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('format', 'json');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('limit', '1');
      url.searchParams.set('q', query);
      if (contactEmail) {
        url.searchParams.set('email', contactEmail);
      }
      return {
        name: 'nominatim',
        url,
        options: {
          headers: {
            'User-Agent': userAgent,
            'Accept-Language': 'en',
          },
        },
      };
    },
    () => {
      const url = new URL('https://geocode.maps.co/search');
      url.searchParams.set('q', query);
      url.searchParams.set('limit', '1');
      return {
        name: 'mapsco',
        url,
        options: {},
      };
    },
  ];

  for (const buildRequest of providers) {
    const { url, options } = buildRequest();

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        continue;
      }

      const payload = await response.json();

      if (!Array.isArray(payload) || payload.length === 0) {
        continue;
      }

      return payload[0];
    } catch (error) {
      // Try the next provider silently
    }
  }

  throw new Error('All geocoding providers failed');
};

export const estimateDeliveryDetails = asyncHandler(async (req, res) => {
  const { deliveryDetails } = req.body;

  const requiredFields = ['recipientName', 'addressLine1', 'city', 'state', 'postalCode'];
  const missingField = requiredFields.find((field) => !deliveryDetails?.[field]);

  if (missingField) {
    return sendResponse(
      res,
      400,
      false,
      `Delivery details missing required field: ${missingField}`
    );
  }

  const query = [
    deliveryDetails.addressLine1,
    deliveryDetails.addressLine2,
    deliveryDetails.city,
    deliveryDetails.state,
    deliveryDetails.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

  let match;
  try {
    match = await geocodeAddress(query);
  } catch (error) {
    return sendResponse(res, 503, false, 'Delivery lookup service is unavailable at the moment. Please try again.');
  }

  const coordinates = {
    lat: Number(match.lat),
    lng: Number(match.lon),
  };

  if (Number.isNaN(coordinates.lat) || Number.isNaN(coordinates.lng)) {
    return sendResponse(res, 400, false, 'Delivery lookup returned invalid coordinates');
  }

  const storeCoordinates = getStoreCoordinates();
  const distanceKm = calculateDistanceKm(storeCoordinates, coordinates);
  const deliveryFee = calculateDeliveryFee(distanceKm);

  const resolvedAddress = {
    city: match.address?.city || match.address?.town || match.address?.village || deliveryDetails.city,
    state: match.address?.state || match.address?.region || deliveryDetails.state,
    postalCode: match.address?.postcode || match.postcode || deliveryDetails.postalCode,
  };

  return sendResponse(res, 200, true, 'Delivery address verified successfully', {
    formattedAddress: match.display_name,
    coordinates,
    distanceKm,
    distanceText: `${distanceKm.toFixed(2)} km`,
    deliveryFee,
    resolvedAddress,
  });
});

// @desc    Create an order (cash on delivery only)
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const {
    serviceId,
    notes,
    mealType,
    customItemName,
    deliveryLocation,
    deliveryDetails = {},
    itemsTotal: clientItemsTotal,
    amount: clientAmount,
    cartItems: rawCartItems = [],
  } = req.body;

  const hasCartItems = Array.isArray(rawCartItems) && rawCartItems.length > 0;

  if (!serviceId && !hasCartItems && (!mealType || !customItemName)) {
    return sendResponse(res, 400, false, 'Provide serviceId, cartItems, or mealType with customItemName');
  }

  if (!deliveryLocation) {
    return sendResponse(res, 400, false, 'Delivery location is required');
  }

  const requiredDeliveryFields = ['recipientName', 'contactNumber', 'area'];
  const missingDeliveryField = requiredDeliveryFields.find((field) => !deliveryDetails?.[field]?.trim());

  if (missingDeliveryField) {
    return sendResponse(
      res,
      400,
      false,
      `Delivery details missing required field: ${missingDeliveryField}`
    );
  }

  const sanitizedDeliveryDetails = {
    recipientName: deliveryDetails.recipientName?.trim(),
    contactNumber: deliveryDetails.contactNumber?.trim(),
    area: deliveryDetails.area?.trim(),
    ...(deliveryDetails.landmark && { landmark: deliveryDetails.landmark.trim() }),
  };

  const sanitizedCartItems = hasCartItems
    ? rawCartItems
        .map((item) => ({
          itemId: item?.itemId ?? item?._id ?? null,
          title: item?.title ?? null,
          mealType: item?.mealType ? String(item.mealType).toLowerCase() : null,
          quantity: Math.max(1, Number(item?.quantity) || 1),
          price: Number(item?.price) || 0,
          type: item?.type ?? null,
        }))
        .filter((item) => Boolean(item.title))
    : [];

  let service = null;
  let itemsTotal = 0;
  let resolvedMealType = mealType?.toLowerCase();
  let resolvedCustomName = customItemName;

  if (serviceId) {
    service = await Service.findById(serviceId);

    if (!service) {
      return sendResponse(res, 404, false, 'Service not found');
    }

    itemsTotal = service.price;
    if (!resolvedMealType) {
      resolvedMealType = service.mealType || 'mixed';
    }
    if (!resolvedCustomName) {
      resolvedCustomName = service.title;
    }
  } else if (hasCartItems) {
    const computedCartTotal = sanitizedCartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    itemsTotal = Number(clientItemsTotal ?? computedCartTotal) || 0;

    if (!resolvedMealType) {
      const uniqueMealTypes = new Set(
        sanitizedCartItems.map((item) => item.mealType).filter(Boolean)
      );
      if (uniqueMealTypes.size === 1) {
        [resolvedMealType] = uniqueMealTypes;
      } else if (uniqueMealTypes.size > 1) {
        resolvedMealType = 'mixed';
      } else {
        resolvedMealType = 'custom';
      }
    }

    if (!resolvedCustomName) {
      resolvedCustomName =
        sanitizedCartItems.length === 1
          ? sanitizedCartItems[0].title
          : `${sanitizedCartItems.length} items`;
    }
  } else {
    const allowedMealTypes = new Set(['breakfast', 'lunch', 'dinner', 'mixed', 'custom']);
    if (!mealType || !allowedMealTypes.has(mealType.toLowerCase())) {
      return sendResponse(res, 400, false, 'Invalid meal type supplied');
    }

    // Custom meal orders default to zero amount unless priced elsewhere
    itemsTotal = Number(clientItemsTotal ?? clientAmount ?? 0) || 0;
    resolvedMealType = mealType.toLowerCase();
    if (!resolvedCustomName) {
      resolvedCustomName = 'Custom meal';
    }
  }

  const configuredDeliveryFee = Number(process.env.DEFAULT_DELIVERY_FEE ?? 50);
  const deliveryFee = Number.isNaN(configuredDeliveryFee) ? 50 : configuredDeliveryFee;
  const baseAmount = Number.isFinite(Number(clientAmount))
    ? Number(clientAmount)
    : itemsTotal + deliveryFee;
  const totalAmount = Math.round(baseAmount * 100) / 100;

  const order = await Order.create({
    user: req.user.id,
    service: service?._id,
    amount: totalAmount,
    itemsTotal,
    deliveryFee,
    status: 'pending',
    notes,
    mealType: resolvedMealType,
    customItemName: resolvedCustomName,
    ...(sanitizedCartItems.length > 0 && { cartItems: sanitizedCartItems }),
    deliveryLocation,
    deliveryDetails: sanitizedDeliveryDetails,
    paymentMethod: 'cod',
  });

  return sendResponse(res, 201, true, 'Order placed successfully with Cash on Delivery', {
    orderId: order._id,
    order,
  });
});

// @desc    Get logged-in user orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate('service', 'title price type')
    .sort({ createdAt: -1 });

  return sendResponse(res, 200, true, 'Orders fetched successfully', orders);
});

// @desc    Admin view of orders placed through the platform
// @route   GET /api/orders/admin
// @access  Private/Admin
export const getAllOrdersForAdmin = asyncHandler(async (req, res) => {
  const { status, paymentMethod, limit = 25 } = req.query;

  const filter = {};

  if (status) {
    filter.status = status.toLowerCase();
  }

  if (paymentMethod) {
    filter.paymentMethod = paymentMethod.toLowerCase();
  }

  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 25, 1), 100);

  const orders = await Order.find(filter)
    .populate('user', 'name email phone')
    .populate('service', 'title price type category')
    .sort({ createdAt: -1 })
    .limit(parsedLimit)
    .lean();

  return sendResponse(res, 200, true, 'Orders fetched successfully', orders);
});

// @desc    Mark a COD order as paid/settled by admin
// @route   PATCH /api/orders/admin/:orderId/cod-settle
// @access  Private/Admin
export const markCodPaymentSettled = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .populate('user', 'name email phone')
    .populate('service', 'title price type category');

  if (!order) {
    return sendResponse(res, 404, false, 'Order not found');
  }

  if (order.paymentMethod !== 'cod') {
    return sendResponse(res, 400, false, 'Only cash-on-delivery orders can be settled manually');
  }

  if (order.status === 'failed') {
    return sendResponse(res, 400, false, 'Cannot mark a failed order as paid');
  }

  if (order.status === 'paid' && order.codSettledAt) {
    return sendResponse(res, 200, true, 'Order already marked as paid', order);
  }

  order.status = 'paid';
  order.codSettledAt = new Date();

  await order.save();

  return sendResponse(res, 200, true, 'COD payment recorded successfully', order);
});
