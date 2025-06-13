const jwt = require('jsonwebtoken');

const handleGoogleCallback = (req, res) => {
  const token = jwt.sign(
    { id: req.user._id, email: req.user.email, role: req.user.role },
    Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString('utf8'),
    { algorithm: 'RS256', expiresIn: '12h' }
  );
  res.redirect(`${process.env.FRONTEND_URL}/profile?token=${token}`);
};

module.exports = { handleGoogleCallback };