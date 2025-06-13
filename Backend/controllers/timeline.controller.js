const Timeline = require('../models/timeline.model');
const Pet = require('../models/pet.model');
const logger = require('../utils/logger');

const createTimelinePoint = async (req, res, next) => {
  try {
    const { user } = req;
    const pet = await Pet.findOne({ _id: req.params.petId, userId: user._id });
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const timeline = await Timeline.create({
      petId: req.params.petId,
      userId: user._id,
      type: req.body.type,
      text: req.body.text,
      teamId: req.body.teamId
    });

    logger.info({ message: 'Timeline point created', timelineId: timeline._id, petId: req.params.petId });
    res.json({ status: 'ok', timeline });
  } catch (err) {
    next(err);
  }
};

const getTimeline = async (req, res, next) => {
  try {
    const { user } = req;
    const query = req.query.search
      ? { petId: req.params.petId, userId: user._id, text: { $regex: req.query.search, $options: 'i' } }
      : { petId: req.params.petId, userId: user._id, hidden: false };

    if (req.query.type) query.type = req.query.type;

    const timeline = await Timeline.find(query).sort({ createdAt: -1 });
    res.json({ status: 'ok', timeline });
  } catch (err) {
    next(err);
  }
};

const hideTimelinePoint = async (req, res, next) => {
  try {
    const { user } = req;
    const timeline = await Timeline.findOne({ _id: req.params.id, userId: user._id });
    if (!timeline) return res.status(404).json({ error: 'Timeline point not found' });

    await Timeline.updateOne({ _id: timeline._id }, { hidden: true });
    logger.info({ message: 'Timeline point hidden', timelineId: timeline._id, petId: timeline.petId });
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};

const deleteTimelinePoint = async (req, res, next) => {
  try {
    const { user } = req;
    const timeline = await Timeline.findOne({ _id: req.params.id, userId: user._id });
    if (!timeline) return res.status(404).json({ error: 'Timeline point not found' });

    await Timeline.deleteOne({ _id: timeline._id });
    logger.info({ message: 'Timeline point deleted', timelineId: timeline._id, petId: timeline.petId });
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createTimelinePoint, getTimeline, hideTimelinePoint, deleteTimelinePoint };