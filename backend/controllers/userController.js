import asyncHandler from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.js';
import User from '../models/User.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    return sendResponse(res, 404, false, 'User not found');
  }

  return sendResponse(res, 200, true, 'Profile fetched successfully', user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return sendResponse(res, 404, false, 'User not found');
  }

  const { name, email, phone } = req.body;

  if (typeof name === 'string' && name.trim()) {
    user.name = name.trim();
  }

  if (typeof email === 'string' && email.trim()) {
    user.email = email.trim();
  }

  if (typeof phone === 'string') {
    user.phone = phone.trim();
  }

  await user.save();

  const sanitizedUser = user.toObject();
  delete sanitizedUser.password;

  return sendResponse(res, 200, true, 'Profile updated successfully', sanitizedUser);
});

export const getRecentSignupsForAdmin = asyncHandler(async (req, res) => {
  const rawLimit = Number.parseInt(req.query.limit, 10);
  const rawDays = Number.parseInt(req.query.days, 10);

  const limit = Number.isNaN(rawLimit) ? 10 : Math.min(Math.max(rawLimit, 1), 50);
  const days = Number.isNaN(rawDays) ? 7 : Math.min(Math.max(rawDays, 1), 90);

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - days + 1);

  const filter = { createdAt: { $gte: since } };

  const [users, count] = await Promise.all([
    User.find(filter)
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return sendResponse(res, 200, true, 'Recent signups fetched successfully', {
    count,
    users,
    since,
  });
});
