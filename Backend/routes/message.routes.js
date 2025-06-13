const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { createMessage, createTemplate, getMessages, getTemplates } = require('../controllers/message.controller');

router.post('/:petId', authenticate, authorize(['admin', 'sub-user']), createMessage);
router.post('/template', authenticate, authorize(['admin', 'sub-user']), createTemplate);
router.get('/:petId', authenticate, authorize(['admin', 'sub-user']), getMessages);
router.get('/templates', authenticate, authorize(['admin', 'sub-user']), getTemplates);

module.exports = router;