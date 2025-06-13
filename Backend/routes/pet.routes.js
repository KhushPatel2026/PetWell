const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { createPet, getPets, updatePet, transferPet } = require('../controllers/pet.controller');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', authenticate, authorize(['individual']), upload.single('profilePicture'), createPet);
router.get('/', authenticate, authorize(['individual']), getPets);
router.put('/:id', authenticate, authorize(['individual']), upload.single('profilePicture'), updatePet);
router.post('/:id/transfer', authenticate, authorize(['individual']), transferPet);

module.exports = router;