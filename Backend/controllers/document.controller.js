const Document = require('../models/document.model');
const Pet = require('../models/pet.model');
const Timeline = require('../models/timeline.model');
const { uploadFile, getSignedUrl } = require('../services/s3.service');
const { processDocument } = require('../services/ocr.service');
const { sendEmail } = require('../services/email.service');
const logger = require('../utils/logger');

const uploadDocument = async (req, res, next) => {
  try {
    const { user } = req;
    const pet = await Pet.findOne({ _id: req.params.petId });
    if (!pet && user.role === 'individual') return res.status(404).json({ error: 'Pet not found' });

    const { key } = await uploadFile(req.file, 'documents');
    const summary = ['png', 'jpeg', 'pdf', 'doc'].includes(req.file.mimetype.split('/')[1]) ? await processDocument(key) : '';

    const document = await Document.create({
      petId: req.params.petId,
      userId: user._id,
      businessId: user.businessId || req.body.businessId,
      name: req.body.name || req.file.originalname,
      type: req.file.mimetype.split('/')[1],
      s3Key: key,
      summary,
      tags: req.body.tags,
      staffId: req.body.staffId
    });

    await Timeline.create({ petId: req.params.petId, userId: user._id, type: 'document', text: `Document ${document.name} uploaded` });
    logger.info({ message: 'Document uploaded', documentId: document._id, petId: req.params.petId });
    res.json({ status: 'ok', document });
  } catch (err) {
    next(err);
  }
};

const getDocuments = async (req, res, next) => {
  try {
    const { user } = req;
    const query = user.role === 'individual'
      ? { petId: req.params.petId, userId: user._id }
      : { petId: req.params.petId, $or: [{ businessId: user.businessId }, { tags: user.businessId }] };

    const documents = await Document.find(query);
    res.json({ status: 'ok', documents });
  } catch (err) {
    next(err);
  }
};

const updateDocument = async (req, res, next) => {
  try {
    const { user } = req;
    const document = await Document.findOne({ _id: req.params.id, userId: user._id });
    if (!document) return res.status(404).json({ error: 'Document not found or unauthorized' });

    await Document.updateOne({ _id: document._id }, { name: req.body.name });
    await Timeline.create({ petId: document.petId, userId: user._id, type: 'document', text: `Document ${document.name} renamed` });
    logger.info({ message: 'Document renamed', documentId: document._id, petId: document.petId });
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};

const getDocumentPreview = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: 'Document not found' });

    const url = await getSignedUrl(document.s3Key);
    res.json({ status: 'ok', url, summary: document.summary });
  } catch (err) {
    next(err);
  }
};

const emailDocument = async (req, res, next) => {
  try {
    const { user } = req;
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: 'Document not found' });

    const url = await getSignedUrl(document.s3Key);
    await sendEmail(req.body.email, `Document: ${document.name}`, `Access your document here: ${url}`);
    logger.info({ message: 'Document emailed', documentId: document._id, to: req.body.email });
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadDocument, getDocuments, updateDocument, getDocumentPreview, emailDocument };