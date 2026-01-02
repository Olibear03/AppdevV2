const mongoose = require('mongoose');
const ComplaintSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  imageUrl: String,
  status: { type: String, default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
module.exports = mongoose.model('Complaint', ComplaintSchema);
