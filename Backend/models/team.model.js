const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true }
}, { timestamps: true });

teamSchema.index({ userId: 1, businessId: 1 });

module.exports = mongoose.model('Team', teamSchema);