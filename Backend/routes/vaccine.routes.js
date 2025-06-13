const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { createVaccine, uploadVaccineDocument, getVaccines, updateVaccine, downloadVaccinePDF } = require('../controllers/vaccine.controller');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/:petId', authenticate, authorize(['individual', 'admin', 'sub-user']), createVaccine);
router.post('/:petId/upload', authenticate, authorize(['individual', 'admin', 'sub-user']), upload.single('document'), uploadVaccineDocument);
router.get('/:petId', authenticate, authorize(['individual', 'admin', 'sub-user']), getVaccines);
router.put('/:id', authenticate, authorize(['individual']), updateVaccine);
router.get('/:petId/pdf', authenticate, authorize(['individual', 'admin', 'sub-user']), downloadVaccinePDF);

module.exports = router;