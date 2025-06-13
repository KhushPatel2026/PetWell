const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Business = require('../models/business.model');
const QRCode = require('qrcode');
const { sendEmail } = require('../services/email.service');
const logger = require('../utils/logger.js');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, inviteCode, location, phone } = req.body;
    if (!['individual', 'admin', 'sub-user'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

    if (role === 'sub-user') {
      const business = await Business.findOne({ inviteCode });
      if (!business) return res.status(400).json({ error: 'Invalid invite code' });
      const subUserCount = await User.countDocuments({ businessId: business._id, role: 'sub-user' });
      const maxSubUsers = business.paymentPlan === 'enterprise' ? 50 : business.paymentPlan === 'premium' ? 20 : 5;
      if (subUserCount >= maxSubUsers) return res.status(400).json({ error: 'Sub-user limit reached' });
    }

    const qrCode = await QRCode.toDataURL(`${process.env.FRONTEND_URL}/profile/${email}`);
    const user = await User.create({ 
      name, 
      email, 
      password, 
      role, 
      location, 
      phone, 
      qrCode, 
      businessId: role === 'sub-user' ? (await Business.findOne({ inviteCode }))._id : null 
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString('utf8'),
      { algorithm: 'RS256', expiresIn: '12h' }
    );

    if (role === 'admin') {
      const business = await Business.create({ 
        name: `${name}'s Business`, 
        email, 
        inviteCode: require('crypto').randomBytes(8).toString('hex') 
      });
      user.businessId = business._id;
      await user.save();
    }

    await sendEmail(email, 'Welcome to PetWell', `Your account has been created! Access your profile at: ${process.env.FRONTEND_URL}/profile/${email}`);
    logger.info({ message: 'User registered', userId: user._id, role });
    res.json({ status: 'ok', token });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString('utf8'),
      { algorithm: 'RS256', expiresIn: '12h' }
    );

    logger.info({ message: 'User logged in', userId: user._id });
    res.json({ status: 'ok', token });
  } catch (err) {
    next(err);
  }
};

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64').toString('utf8'), { algorithms: ['RS256'] });
    res.json({ status: 'ok', user: decoded });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, verifyToken };