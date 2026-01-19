import { sendResponse } from '../utils/response.js';

// Handle routes that are not found
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Centralized error handler for Express
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  return sendResponse(res, statusCode, false, err.message || 'Server Error');
};
