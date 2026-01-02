const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  // allow structured location objects (lat/lon) or string
  location: { type: mongoose.Schema.Types.Mixed },
  imageUrl: { type: String },
  status: { type: String, default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  college: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);