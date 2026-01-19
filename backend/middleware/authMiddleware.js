import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import { sendResponse } from '../utils/response.js';

// Protect routes and attach user to request object
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendResponse(res, 401, false, 'Not authorized, token missing');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return sendResponse(res, 401, false, 'User not found');
    }

    next();
  } catch (error) {
    return sendResponse(res, 401, false, 'Not authorized, token failed');
  }
});

// Restrict access to admin users
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return sendResponse(res, 403, false, 'Not authorized as admin');
};
