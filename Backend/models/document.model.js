const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  name: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'doc', 'png', 'jpeg', 'mov'] },
  s3Key: { type: String, required: true },
  summary: { type: String },
  tags: [{ type: String }],
  staffId: { type: String }
}, { timestamps: true });

documentSchema.index({ petId: 1, userId: 1 });
documentSchema.index({ businessId: 1 });

module.exports = mongoose.model('Document', documentSchema);