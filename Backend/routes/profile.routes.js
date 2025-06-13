const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getProfile, editProfile, changePassword, updatePaymentPlan, deleteProfile } = require('../controllers/profile.controller');

router.get('/', authenticate, getProfile);
router.put('/', authenticate, editProfile);
router.put('/password', authenticate, changePassword);
router.put('/payment-plan', authenticate, updatePaymentPlan);
router.delete('/', authenticate, deleteProfile);

module.exports = router;