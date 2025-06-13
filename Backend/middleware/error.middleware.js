const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({ 
    message: err.message, 
    stack: err.stack, 
    method: req.method, 
    url: req.url, 
    user: req.user ? req.user._id : 'unauthenticated' 
  });
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ 
    error: err.message || 'Internal Server Error', 
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }) 
  });
};

module.exports = errorHandler;