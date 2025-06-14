const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { register, login, verifyToken, verifyEmail, resendVerification, requestPasswordReset, verifyPasswordReset } = require('../controllers/auth.controller');
const passport = require('../utils/passport.config');

router.post('/register', register);
router.post('/login', login);
router.get('/verify-token', authenticate, verifyToken);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/password-reset', requestPasswordReset);
router.post('/reset-password', verifyPasswordReset);

router.get('/google', passport.authenticate('google-oauth-token', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google-oauth20', { session: false }), require('../controllers/socialAuth.controller').handleGoogleCallback);

module.exports = router;