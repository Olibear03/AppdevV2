const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  studentId: String,
  college: String,
  password: String,
  role: { type: String, enum: ['student', 'admin', 'superadmin'] }
});
module.exports = mongoose.model('User', UserSchema);
