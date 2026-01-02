const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  studentId: { type: String },
  college: { type: String },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['student', 'admin', 'superadmin'],
    default: 'student'
  },
  lastPasswordChange: { type: Date }, // ✅ track when password was last updated
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
