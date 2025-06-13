const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { createTimelinePoint, getTimeline, hideTimelinePoint, deleteTimelinePoint } = require('../controllers/timeline.controller');

router.post('/:petId', authenticate, authorize(['individual']), createTimelinePoint);
router.get('/:petId', authenticate, authorize(['individual']), getTimeline);
router.put('/:id/hide', authenticate, authorize(['individual']), hideTimelinePoint);
router.delete('/:id', authenticate, authorize(['individual']), deleteTimelinePoint);

module.exports = router;