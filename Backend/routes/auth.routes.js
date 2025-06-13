const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, verifyToken } = require('../controllers/auth.controller');
const { handleGoogleCallback } = require('../controllers/socialAuth.controller');

router.post('/register', register);
router.post('/login', login);
router.get('/verify-token', verifyToken);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/register' }), handleGoogleCallback);

module.exports = router;