const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  studentId: String,
  description: String,
  category: String,
  urgency: String,
  college: String,
  location: {
    latitude: Number,
    longitude: Number,
  },
  photo: String,
  status: { type: String, default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
