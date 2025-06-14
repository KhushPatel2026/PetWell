const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['individual', 'admin', 'sub-user'], default: 'individual' },
  location: { type: String },
  phone: { type: String },
  paymentPlan: { type: String, enum: ['basic', 'premium', 'enterprise'], default: 'basic' },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  qrCode: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.index({ businessId: 1 });

module.exports = mongoose.model('User', userSchema);