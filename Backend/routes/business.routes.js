const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { createBusiness, getBusiness, updateBusiness } = require('../controllers/business.controller');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', authenticate, authorize(['admin']), upload.single('profileImage'), createBusiness);
router.get('/', authenticate, authorize(['admin', 'sub-user']), getBusiness);
router.put('/', authenticate, authorize(['admin']), upload.single('profileImage'), updateBusiness);

module.exports = router;