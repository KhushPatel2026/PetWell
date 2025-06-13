const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  species: { type: String, enum: ['dog', 'cat'], required: true },
  breed: { type: String, required: true },
  age: { type: Number, min: 0 },
  weight: { type: Number, min: 0 },
  location: { type: String },
  spayNeuter: { type: String, enum: ['spayed', 'neutered', 'intact'] },
  color: { type: String },
  dateOfBirth: { type: Date },
  microchip: { type: String },
  notes: { type: String },
  profilePicture: { type: String }
}, { timestamps: true });

petSchema.index({ userId: 1 });
petSchema.index({ name: 1 });

module.exports = mongoose.model('Pet', petSchema);