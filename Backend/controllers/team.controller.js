const Team = require('../models/team.model');
const Business = require('../models/business.model');
const { sendEmail } = require('../services/email.service');
const logger = require('../utils/logger');

const addTeam = async (req, res, next) => {
  try {
    const { user } = req;
    const business = await Business.findOne({ email: req.body.email });
    if (!business) return res.status(404).json({ error: 'Business not found' });

    const team = await Team.create({ userId: user._id, businessId: business._id });
    await sendEmail(business.email, `New Team Member Added`, `${user.name} has added your business to their team.`);
    logger.info({ message: 'Team added', teamId: team._id, userId: user._id });
    res.json({ status: 'ok', team });
  } catch (err) {
    next(err);
  }
};

const getTeams = async (req, res, next) => {
  try {
    const { user } = req;
    const teams = await Team.find({ userId: user._id }).populate('businessId');
    res.json({ status: 'ok', teams });
  } catch (err) {
    next(err);
  }
};

const deleteTeam = async (req, res, next) => {
  try {
    const { user } = req;
    const team = await Team.findOne({ _id: req.params.id, userId: user._id });
    if (!team) return res.status(404).json({ error: 'Team not found' });

    await Team.deleteOne({ _id: team._id });
    logger.info({ message: 'Team deleted', teamId: team._id, userId: user._id });
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};

const contactTeam = async (req, res, next) => {
  try {
    const { user } = req;
    const team = await Team.findOne({ _id: req.params.id, userId: user._id }).populate('businessId');
    if (!team) return res.status(404).json({ error: 'Team not found' });

    await sendEmail(team.businessId.email, `Contact from ${user.name}`, req.body.message);
    logger.info({ message: 'Team contacted', teamId: team._id, userId: user._id });
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};

module.exports = { addTeam, getTeams, deleteTeam, contactTeam };