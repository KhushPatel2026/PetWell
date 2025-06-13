const Business = require('../models/business.model');
const User = require('../models/user.model');
const { uploadFile } = require('../services/s3.service');
const logger = require('../utils/logger');

const createBusiness = async (req, res, next) => {
  try {
    const { user } = req;
    if (user.role !== 'admin') return res.status(403).json({ error: 'Only admin users can create businesses' });

    const businessData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      website: req.body.website,
      socials: req.body.socials,
      description: req.body.description,
      staff: req.body.staff,
      paymentPlan: req.body.paymentPlan || 'basic'
    };

    if (req.file) {
      const { key } = await uploadFile(req.file, 'business-profiles');
      businessData.profileImage = key;
    }

    const business = await Business.create(businessData);
    await User.updateOne({ _id: user._id }, { businessId: business._id });
    logger.info({ message: 'Business created', businessId: business._id, userId: user._id });
    res.json({ status: 'ok', business });
  } catch (err) {
    next(err);
  }
};

const getBusiness = async (req, res, next) => {
  try {
    const { user } = req;
    const business = await Business.findOne({ _id: user.businessId });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    res.json({ status: 'ok', business });
  } catch (err) {
    next(err);
  }
};

const updateBusiness = async (req, res, next) => {
  try {
    const { user } = req;
    const business = await Business.findOne({ _id: user.businessId });
    if (!business) return res.status(404).json({ error: 'Business not found' });

    const updates = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      website: req.body.website,
      socials: req.body.socials,
      description: req.body.description,
      staff: req.body.staff
    };

    if (req.file) {
      const { key } = await uploadFile(req.file, 'business-profiles');
      updates.profileImage = key;
    }

    await Business.updateOne({ _id: business._id }, updates);
    logger.info({ message: 'Business updated', businessId: business._id, userId: user._id });
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBusiness, getBusiness, updateBusiness };