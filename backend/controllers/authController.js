import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/response.js';
import { sendEmail } from '../utils/mailer.js';

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 5);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 60);

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  phoneVerified: user.phoneVerified,
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const ensureValidPhone = (phone) => {
  const trimmed = phone?.toString().trim();

  if (!trimmed) {
    return { valid: false, message: 'Phone number is required' };
  }

  if (!/^\d{10}$/.test(trimmed)) {
    return { valid: false, message: 'Provide a valid 10-digit phone number' };
  }

  return { valid: true, value: trimmed };
};

const sendOtpToUser = async (user, purpose = 'login') => {
  if (!user.email) {
    const error = new Error('User email is missing. Cannot send OTP');
    error.statusCode = 500;
    throw error;
  }

  if (!user.phone) {
    const error = new Error('Phone number is missing on this account. Please update it first.');
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();

  if (user.phoneOtpLastSent) {
    const diffMs = now.getTime() - user.phoneOtpLastSent.getTime();
    const cooldownMs = OTP_RESEND_COOLDOWN_SECONDS * 1000;

    if (diffMs < cooldownMs) {
      const waitSeconds = Math.ceil((cooldownMs - diffMs) / 1000);
      const error = new Error(`Please wait ${waitSeconds}s before requesting another OTP`);
      error.statusCode = 429;
      throw error;
    }
  }

  const otp = generateOtp();
  const salt = await bcrypt.genSalt(8);

  user.phoneOtpCode = await bcrypt.hash(otp, salt);
  user.phoneOtpExpires = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);
  user.phoneOtpLastSent = now;

  await user.save();

  const subject = purpose === 'signup' ? 'Confirm your HomeBite signup' : 'HomeBite login verification';
  const greeting = user.name ? `Hi ${user.name.split(' ')[0]},` : 'Hello,';
  const html = `
    <p>${greeting}</p>
    <p>Your one-time password is:</p>
    <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
    <p>This code will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
    <p>If you did not initiate this request, please ignore this email.</p>
    <p>— HomeBite Security</p>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject,
      html,
      text: `${greeting}\nYour OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes. If you did not request this, please ignore this email.\n— HomeBite Security`,
    });
  } catch (error) {
    const err = new Error('Failed to send OTP email. Please try again later.');
    err.statusCode = 502;
    throw err;
  }
};

// @desc    User signup
// @route   POST /api/auth/signup
// @access  Public
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return sendResponse(res, 400, false, 'Please provide name, email, and password');
  }

  const phoneValidation = ensureValidPhone(phone);

  if (!phoneValidation.valid) {
    return sendResponse(res, 400, false, phoneValidation.message);
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return sendResponse(res, 400, false, 'User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone: phoneValidation.value,
    phoneVerified: false,
  });

  try {
    await sendOtpToUser(user, 'signup');
  } catch (error) {
    return sendResponse(res, error.statusCode || 500, false, error.message);
  }

  return sendResponse(res, 201, true, 'OTP sent to your email. Please verify to complete signup.', {
    userId: user._id,
    requiresOtp: true,
  });
});

// @desc    User login
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendResponse(res, 400, false, 'Please provide email and password');
  }

  const user = await User.findOne({ email });

  if (!user) {
    return sendResponse(res, 401, false, 'Invalid credentials');
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return sendResponse(res, 401, false, 'Invalid credentials');
  }

  try {
    await sendOtpToUser(user, 'login');
  } catch (error) {
    return sendResponse(res, error.statusCode || 500, false, error.message);
  }

  return sendResponse(res, 200, true, 'OTP sent to your email address', {
    requiresOtp: true,
    userId: user._id,
  });
});

// @desc    Verify OTP for signup/login
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return sendResponse(res, 400, false, 'User ID and OTP are required');
  }

  const user = await User.findById(userId);

  if (!user) {
    return sendResponse(res, 404, false, 'User not found');
  }

  if (!user.phoneOtpCode || !user.phoneOtpExpires) {
    return sendResponse(res, 400, false, 'No OTP request found. Please request a new OTP.');
  }

  if (user.phoneOtpExpires.getTime() < Date.now()) {
    return sendResponse(res, 400, false, 'OTP has expired. Please request a new OTP.');
  }

  const isValid = await bcrypt.compare(otp, user.phoneOtpCode);

  if (!isValid) {
    return sendResponse(res, 400, false, 'Invalid OTP. Please try again.');
  }

  user.phoneVerified = true;
  user.phoneOtpCode = undefined;
  user.phoneOtpExpires = undefined;
  user.phoneOtpLastSent = undefined;
  await user.save();

  const token = generateToken(user);

  return sendResponse(res, 200, true, 'OTP verified successfully', {
    user: sanitizeUser(user),
    token,
  });
});

// @desc    Resend OTP for signup/login
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOtp = asyncHandler(async (req, res) => {
  const { userId, purpose = 'login' } = req.body;

  if (!userId) {
    return sendResponse(res, 400, false, 'User ID is required');
  }

  const user = await User.findById(userId);

  if (!user) {
    return sendResponse(res, 404, false, 'User not found');
  }

  try {
    await sendOtpToUser(user, purpose);
  } catch (error) {
    return sendResponse(res, error.statusCode || 500, false, error.message);
  }

  return sendResponse(res, 200, true, 'OTP resent successfully', {
    requiresOtp: true,
  });
});
