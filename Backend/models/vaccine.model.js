const mongoose = require('mongoose');

const vaccineSchema = new mongoose.Schema({
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  brand: { type: String, required: true },
  preventative: { type: String, required: true },
  name: { type: String, required: true },
  dateAdministered: { type: Date, required: true },
  dateDue: { type: Date, required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  administeredBy: { type: String },
  attestation: { type: Boolean, default: false }
}, { timestamps: true });

vaccineSchema.index({ petId: 1, dateDue: 1 });

module.exports = mongoose.model('Vaccine', vaccineSchema);