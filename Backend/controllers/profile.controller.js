const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

const getProfile = async (req, res, next) => {
  try {
    const { user } = req;
    const profile = await User.findById(user._id).select('-password');
    res.json({ status: 'ok', profile });
  } catch (err) {
    next(err);
  }
};

const editProfile = async (req, res, next) => {
  try {
    const { user } = req;
    const updates = { 
      name: req.body.name, 
      email: req.body.email, 
      location: req.body.location, 
      phone: req.body.phone 
    };
    const updatedUser = await User.findByIdAndUpdate(user._id, updates, { new: true }).select('-password');
    logger.info({ message: 'Profile updated', userId: user._id });
    res.json({ status: 'ok', profile: updatedUser });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { user } = req;
    const { currentPassword, newPassword } = req.body;

    const userDoc = await User.findById(user._id);
    const isMatch = await bcrypt.compare(currentPassword, userDoc.password);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

    userDoc.password = newPassword;
    await userDoc.save();
    logger.info({ message: 'Password changed', userId: user._id });
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};

const updatePaymentPlan = async (req, res, next) => {
  try {
    const { user } = req;
    const { paymentPlan } = req.body;
    if (!['basic', 'premium', 'enterprise'].includes(paymentPlan)) return res.status(400).json({ error: 'Invalid payment plan' });

    await User.updateOne({ _id: user._id }, { paymentPlan });
    logger.info({ message: 'Payment plan updated', userId: user._id, paymentPlan });
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};

const deleteProfile = async (req, res, next) => {
  try {
    const { user } = req;
    await User.deleteOne({ _id: user._id });
    logger.info({ message: 'Profile deleted', userId: user._id });
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, editProfile, changePassword, updatePaymentPlan, deleteProfile };