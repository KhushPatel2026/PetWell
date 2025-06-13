const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const authenticate = async (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64').toString('utf8'), { algorithms: ['RS256'] });
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Unauthorized access' });
  next();
};

module.exports = { authenticate, authorize };