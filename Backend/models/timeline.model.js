const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['appointment', 'note', 'reminder', 'document', 'vaccine', 'team'], required: true },
  text: { type: String },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  hidden: { type: Boolean, default: false }
}, { timestamps: true });

timelineSchema.index({ petId: 1, createdAt: -1 });
timelineSchema.index({ userId: 1 });

module.exports = mongoose.model('Timeline', timelineSchema);