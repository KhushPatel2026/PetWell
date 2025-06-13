const Pet = require('../models/pet.model');
const Timeline = require('../models/timeline.model');
const { uploadFile } = require('../services/s3.service');
const logger = require('../utils/logger.js');

const createPet = async (req, res, next) => {
  try {
    const { user } = req;
    if (user.role !== 'individual') return res.status(403).json({ error: 'Only individual users can create pet profiles' });

    const petCount = await Pet.countDocuments({ userId: user._id });
    const maxPets = user.paymentPlan === 'enterprise' ? 10 : user.paymentPlan === 'premium' ? 5 : 2;
    if (petCount >= maxPets) return res.status(400).json({ error: 'Pet profile limit reached' });

    const petData = {
      userId: user._id,
      name: req.body.name,
      species: req.body.species,
      breed: req.body.breed,
      age: req.body.age,
      weight: req.body.weight,
      location: req.body.location,
      spayNeuter: req.body.spayNeuter,
      color: req.body.color,
      dateOfBirth: req.body.dateOfBirth,
      microchip: req.body.microchip,
      notes: req.body.notes
    };

    if (req.file) {
      const { key } = await uploadFile(req.file, 'pet-profiles');
      petData.profilePicture = key;
    }

    const pet = await Pet.create(petData);
    await Timeline.create({ petId: pet._id, userId: user._id, type: 'pet', text: `Pet ${pet.name} created` });
    logger.info({ message: 'Pet created', petId: pet._id, userId: user._id });
    res.json({ status: 'ok', pet });
  } catch (err) {
    next(err);
  }
};

const getPets = async (req, res, next) => {
  try {
    const { user } = req;
    const pets = await Pet.find({ userId: user._id });
    res.json({ status: 'ok', pets });
  } catch (err) {
    next(err);
  }
};

const updatePet = async (req, res, next) => {
  try {
    const { user } = req;
    const pet = await Pet.findOne({ _id: req.params.id, userId: user._id });
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const updates = {
      name: req.body.name,
      species: req.body.species,
      breed: req.body.breed,
      age: req.body.age,
      weight: req.body.weight,
      location: req.body.location,
      spayNeuter: req.body.spayNeuter,
      color: req.body.color,
      dateOfBirth: req.body.dateOfBirth,
      microchip: req.body.microchip,
      notes: req.body.notes
    };

    if (req.file) {
      const { key } = await uploadFile(req.file, 'pet-profiles');
      updates.profilePicture = key;
    }

    await Pet.updateOne({ _id: pet._id }, updates);
    await Timeline.create({ petId: pet._id, userId: user._id, type: 'pet', text: `Pet ${pet.name} updated` });
    logger.info({ message: 'Pet updated', petId: pet._id, userId: user._id });
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};

const transferPet = async (req, res, next) => {
  try {
    const { user } = req;
    const { newOwnerEmail } = req.body;
    const pet = await Pet.findOne({ _id: req.params.id, userId: user._id });
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const newOwner = await User.findOne({ email: newOwnerEmail, role: 'individual' });
    if (!newOwner) return res.status(404).json({ error: 'New owner not found' });

    pet.userId = newOwner._id;
    await pet.save();
    await Timeline.create({ petId: pet._id, userId: user._id, type: 'pet', text: `Pet ${pet.name} transferred to ${newOwner.email}` });
    logger.info({ message: 'Pet transferred', petId: pet._id, from: user._id, to: newOwner._id });
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPet, getPets, updatePet, transferPet };