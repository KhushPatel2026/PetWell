const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { uploadDocument, getDocuments, updateDocument, getDocumentPreview, emailDocument } = require('../controllers/document.controller');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/:petId', authenticate, authorize(['individual', 'admin', 'sub-user']), upload.single('document'), uploadDocument);
router.get('/:petId', authenticate, authorize(['individual', 'admin', 'sub-user']), getDocuments);
router.put('/:id', authenticate, authorize(['individual', 'admin', 'sub-user']), updateDocument);
router.get('/:id/preview', authenticate, authorize(['individual', 'admin', 'sub-user']), getDocumentPreview);
router.post('/:id/email', authenticate, authorize(['individual', 'admin', 'sub-user']), emailDocument);

module.exports = router;