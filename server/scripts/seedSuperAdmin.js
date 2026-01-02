// server/scripts/seedSuperAdmin.js
require('dotenv').config({ path: __dirname + '/../.env' }); // 👈 explicitly load ../.env
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // adjust if your User model path differs

async function run() {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI); // debug check

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas");

    // Check if superadmin already exists
    const existing = await User.findOne({ email: "superadmin@cvsu.edu.ph" });
    if (existing) {
      console.log("ℹ️ Superadmin already exists:", existing.email);
    } else {
      const hashedPassword = await bcrypt.hash("SuperSecret123", 10);
      const superAdmin = new User({
        fullName: "System SuperAdmin",
        email: "superadmin@cvsu.edu.ph",
        studentId: "0000-0000",
        college: "Administration",
        password: hashedPassword,
        role: "superadmin"
      });
      await superAdmin.save();
      console.log("✅ Superadmin created successfully");
    }

    mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB Atlas");
  } catch (err) {
    console.error("❌ Error seeding superadmin:", err);
  }
}

run();
