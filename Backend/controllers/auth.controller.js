const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');
const { generateQRCode } = require('../utils/qrcode.util');
const logger = require('../utils/logger');

const generateVerificationToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_PRIVATE_KEY, { expiresIn: '2h' });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, location, phone, inviteCode } = req.body;
    if (!['individual', 'admin', 'sub-user'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    let businessId = null;
    if (role === 'sub-user' && inviteCode) {
      const business = await require('../models/business.model').findOne({ inviteCode });
      if (!business) return res.status(400).json({ error: 'Invalid invite code' });
      businessId = business._id;
    }

    const qrCode = await generateQRCode(email);
    const verificationToken = generateVerificationToken(email);
    const user = new User({ name, email, password, role, location, phone, businessId, qrCode, verificationToken });
    await user.save();

    await sendVerificationEmail(email, verificationToken);
    logger.info(`User registered and verification email sent: ${email}`);

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_PRIVATE_KEY, { expiresIn: '7d' });
    res.status(200).json({ status: 'ok', token, message: 'Please verify your email to log in' });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ error: 'Email not verified' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_PRIVATE_KEY, { expiresIn: '7d' });
    logger.info(`User logged in: ${email}`);
    res.status(200).json({ status: 'ok', token });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('x-access-token');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    logger.info(`Token verified for user: ${user.email}`);
    res.status(200).json({ status: 'ok', user });
  } catch (error) {
    logger.error(`Token verification error: ${error.message}`);
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    const user = await User.findOne({ email: decoded.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isVerified) return res.status(400).json({ error: 'Email already verified' });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    logger.info(`Email verified for user: ${user.email}`);
    res.status(200).json({ status: 'ok', message: 'Email verified successfully' });
  } catch (error) {
    logger.error(`Email verification error: ${error.message}`);
    next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isVerified) return res.status(400).json({ error: 'Email already verified' });

    const lastSent = user.updatedAt || user.createdAt;
    const timeSinceLastSent = (Date.now() - lastSent) / 1000 / 60; // Minutes
    if (timeSinceLastSent < 2) {
      return res.status(429).json({ error: 'Please wait 2 minutes before resending' });
    }

    const verificationToken = generateVerificationToken(email);
    user.verificationToken = verificationToken;
    await user.save();

    await sendVerificationEmail(email, verificationToken);
    logger.info(`Verification email resent to: ${email}`);
    res.status(200).json({ status: 'ok', message: 'Verification email resent' });
  } catch (error) {
    logger.error(`Resend verification error: ${error.message}`);
    next(error);
  }
};

const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resetToken = generateVerificationToken(email);
    user.verificationToken = resetToken;
    await user.save();

    await sendPasswordResetEmail(email, resetToken);
    logger.info(`Password reset link sent to: ${email}`);
    res.status(200).json({ status: 'ok', message: 'Password reset link sent' });
  } catch (error) {
    logger.error(`Password reset request error: ${error.message}`);
    next(error);
  }
};

const verifyPasswordReset = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Missing token or password' });

    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    const user = await User.findOne({ email: decoded.id, verificationToken: token });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = newPassword;
    user.verificationToken = undefined;
    await user.save();

    logger.info(`Password reset for user: ${user.email}`);
    res.status(200).json({ status: 'ok', message: 'Password reset successfully' });
  } catch (error) {
    logger.error(`Password reset verification error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  register,
  login,
  verifyToken,
  verifyEmail,
  resendVerification,
  requestPasswordReset,
  verifyPasswordReset
};