const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { addTeam, getTeams, deleteTeam, contactTeam } = require('../controllers/team.controller');

router.post('/', authenticate, authorize(['individual']), addTeam);
router.get('/', authenticate, authorize(['individual']), getTeams);
router.delete('/:id', authenticate, authorize(['individual']), deleteTeam);
router.post('/:id/contact', authenticate, authorize(['individual']), contactTeam);

module.exports = router;