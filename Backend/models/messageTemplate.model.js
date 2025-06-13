const mongoose = require('mongoose');

const messageTemplateSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  name: { type: String, required: true },
  components: { 
    shortText: String, 
    longText: String, 
    date: Boolean, 
    contactInfo: Boolean, 
    link: Boolean 
  }
}, { timestamps: true });

messageTemplateSchema.index({ businessId: 1 });

module.exports = mongoose.model('MessageTemplate', messageTemplateSchema);