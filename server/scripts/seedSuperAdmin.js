require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const email = 'superadmin@cvsu.edu.ph';
  const exists = await User.findOne({ email });
  if (exists) {
    console.log('Super admin already exists');
    process.exit(0);
  }
  const passwordHash = await bcrypt.hash('ChangeThisPassword!', 12);
  const u = new User({
    name: 'CvSU Super Admin',
    email,
    passwordHash,
    role: 'super_admin',
    college: 'GS-OLC'
  });
  await u.save();
  console.log('Super admin created:', email);
  process.exit(0);
})();
