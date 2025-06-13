const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  fromStaff: { type: String },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'MessageTemplate' },
  content: { 
    shortText: String, 
    longText: String, 
    date: Date, 
    contactInfo: String, 
    link: String 
  }
}, { timestamps: true });

messageSchema.index({ petId: 1, businessId: 1 });

module.exports = mongoose.model('Message', messageSchema);