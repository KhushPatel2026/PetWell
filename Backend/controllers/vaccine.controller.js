const Vaccine = require('../models/vaccine.model');
const Pet = require('../models/pet.model');
const User = require('../models/user.model');
const Timeline = require('../models/timeline.model');
const { generateVaccinePDF } = require('../services/pdf.service');
const { processVaccineDocument } = require('../services/ocr.service');
const { uploadFile } = require('../services/s3.service');
const { sendEmail } = require('../services/email.service');
const logger = require('../utils/logger');

const createVaccine = async (req, res, next) => {
  try {
    const { user } = req;
    const pet = await Pet.findOne({ _id: req.params.petId, userId: user._id });
    if (!pet && user.role === 'individual') return res.status(404).json({ error: 'Pet not found' });

    const vaccine = await Vaccine.create({
      petId: req.params.petId,
      userId: user._id,
      brand: req.body.brand,
      preventative: req.body.preventative,
      name: req.body.name,
      dateAdministered: req.body.dateAdministered,
      dateDue: req.body.dateDue,
      location: req.body.location,
      administeredBy: req.body.administeredBy,
      attestation: req.body.attestation
    });

    await checkVaccineAlert(vaccine, pet);
    await Timeline.create({ petId: req.params.petId, userId: user._id, type: 'vaccine', text: `Vaccine ${vaccine.name} added` });
    logger.info({ message: 'Vaccine created', vaccineId: vaccine._id, petId: req.params.petId });
    res.json({ status: 'ok', vaccine });
  } catch (err) {
    next(err);
  }
};

const uploadVaccineDocument = async (req, res, next) => {
  try {
    const { user } = req;
    const pet = await Pet.findOne({ _id: req.params.petId, userId: user._id });
    if (!pet && user.role === 'individual') return res.status(404).json({ error: 'Pet not found' });

    const { key } = await uploadFile(req.file, 'vaccine-documents');
    const vaccineData = await processVaccineDocument(key, req.params.petId, user._id);
    
    const vaccine = await Vaccine.create(vaccineData);
    await checkVaccineAlert(vaccine, pet);
    await Timeline.create({ petId: req.params.petId, userId: user._id, type: 'vaccine', text: `Vaccine document uploaded for ${vaccine.name}` });
    logger.info({ message: 'Vaccine document uploaded', vaccineId: vaccine._id, petId: req.params.petId });
    res.json({ status: 'ok', vaccine });
  } catch (err) {
    next(err);
  }
};

const getVaccines = async (req, res, next) => {
  try {
    const { user } = req;
    const query = user.role === 'individual' 
      ? { petId: req.params.petId, userId: user._id }
      : { petId: req.params.petId, location: user.businessId };

    const vaccines = await Vaccine.find(query).populate('location');
    const now = new Date();
    const alerts = vaccines.map(v => ({
      ...v._doc,
      alert: new Date(v.dateDue) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    }));

    res.json({ status: 'ok', vaccines: alerts });
  } catch (err) {
    next(err);
  }
};

const updateVaccine = async (req, res, next) => {
  try {
    const { user } = req;
    const vaccine = await Vaccine.findOne({ _id: req.params.id, userId: user._id });
    if (!vaccine) return res.status(404).json({ error: 'Vaccine not found or unauthorized' });

    await Vaccine.updateOne({ _id: vaccine._id }, {
      brand: req.body.brand,
      preventative: req.body.preventative,
      name: req.body.name,
      dateAdministered: req.body.dateAdministered,
      dateDue: req.body.dateDue,
      location: req.body.location,
      administeredBy: req.body.administeredBy,
      attestation: req.body.attestation
    });

    const pet = await Pet.findById(vaccine.petId);
    await checkVaccineAlert(vaccine, pet);
    await Timeline.create({ petId: vaccine.petId, userId: user._id, type: 'vaccine', text: `Vaccine ${vaccine.name} updated` });
    logger.info({ message: 'Vaccine updated', vaccineId: vaccine._id, petId: vaccine.petId });
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};

const downloadVaccinePDF = async (req, res, next) => {
  try {
    const { user } = req;
    const pet = await Pet.findOne({ _id: req.params.petId }).populate('userId');
    const vaccines = await Vaccine.find({ petId: req.params.petId }).populate('location');
    
    const pdfBuffer = await generateVaccinePDF(pet, vaccines, user);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename=${pet.name}_vaccines.pdf` });
    logger.info({ message: 'Vaccine PDF downloaded', petId: req.params.petId, userId: user._id });
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

const checkVaccineAlert = async (vaccine, pet) => {
  const now = new Date();
  const dueDate = new Date(vaccine.dateDue);
  const alertThreshold = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const user = await User.findById(pet.userId);

  if (dueDate <= alertThreshold || dueDate < now) {
    const team = await Team.findOne({ businessId: vaccine.location });
    const business = team ? await Business.findById(team.businessId) : null;
    await sendEmail(
      user.email,
      `Vaccine Alert for ${pet.name}`,
      `The vaccine ${vaccine.name} is ${dueDate < now ? 'past due' : 'due soon'} on ${dueDate.toLocaleDateString()}. Contact ${business ? business.name : 'your vet'} at ${business ? business.phone : 'N/A'} to schedule an appointment.`
    );
    logger.info({ message: 'Vaccine alert sent', vaccineId: vaccine._id, userId: user._id });
  }
};

module.exports = { createVaccine, uploadVaccineDocument, getVaccines, updateVaccine, downloadVaccinePDF };