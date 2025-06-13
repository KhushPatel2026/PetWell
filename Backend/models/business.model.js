const mongoose = require('mongoose');
const crypto = require('crypto');

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  phone: { type: String },
  website: { type: String },
  socials: { instagram: String, facebook: String },
  profileImage: { type: String },
  description: { type: String },
  staff: [{ name: String, role: String }],
  inviteCode: { type: String, unique: true, default: () => crypto.randomBytes(8).toString('hex') },
  paymentPlan: { type: String, enum: ['basic', 'premium', 'enterprise'], default: 'basic' }
}, { timestamps: true });

module.exports = mongoose.model('Business', businessSchema);