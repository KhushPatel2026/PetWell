const Message = require('../models/message.model');
const MessageTemplate = require('../models/messageTemplate.model');
const Pet = require('../models/pet.model');
const User = require('../models/user.model');
const { sendEmail } = require('../services/email.service');
const logger = require('../utils/logger.js');

const createMessage = async (req, res, next) => {
  try {
    const { user } = req;
    if (!['admin', 'sub-user'].includes(user.role)) return res.status(403).json({ error: 'Unauthorized' });

    const pet = await Pet.findById(req.params.petId).populate('userId');
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const message = await Message.create({
      petId: req.params.petId,
      userId: user._id,
      businessId: user.businessId,
      fromStaff: req.body.fromStaff,
      templateId: req.body.templateId,
      content: req.body.content
    });

    await sendEmail(
      pet.userId.email,
      `Message from ${user.name}`,
      `You have a new message regarding ${pet.name}: ${req.body.content.shortText || req.body.content.longText}`
    );
    logger.info({ message: 'Message created', messageId: message._id, petId: req.params.petId });
    res.json({ status: 'ok', message });
  } catch (err) {
    next(err);
  }
};

const createTemplate = async (req, res, next) => {
  try {
    const { user } = req;
    if (user.paymentPlan !== 'enterprise') return res.status(403).json({ error: 'Template creation requires enterprise plan' });

    const template = await MessageTemplate.create({
      businessId: user.businessId,
      name: req.body.name,
      components: req.body.components
    });

    logger.info({ message: 'Message template created', templateId: template._id, businessId: user.businessId });
    res.json({ status: 'ok', template });
  } catch (err) {
    next(err);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { user } = req;
    const messages = await Message.find({ petId: req.params.petId, businessId: user.businessId }).populate('templateId');
    res.json({ status: 'ok', messages });
  } catch (err) {
    next(err);
  }
};

const getTemplates = async (req, res, next) => {
  try {
    const { user } = req;
    const templates = await MessageTemplate.find({ businessId: user.businessId });
    res.json({ status: 'ok', templates });
  } catch (err) {
    next(err);
  }
};

module.exports = { createMessage, createTemplate, getMessages, getTemplates };