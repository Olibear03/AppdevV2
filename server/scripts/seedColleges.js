require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const colleges = [
    'College of Agriculture, Food, Environment, and Natural Resources (CAFENR)',
    'College of Arts and Sciences (CAS)',
    'College of Criminal Justice (CCJ)',
    'College of Economics, Management, and Development Studies (CEMDS)',
    'College of Education (CED)',
    'College of Engineering and Information Technology (CEIT)',
    'College of Medicine (COM)',
    'College of Nursing (CON)',
    'College of Sports, Physical Education, and Recreation (CSPEAR)',
    'College of Tourism and Hospitality Management (CTHM)',
    'College of Veterinary Medicine and Biomedical Sciences (CVMBS)',
    'Graduate School and Open Learning College (GS-OLC)'
];

const getEmail = (college) => {
    // simple mapping or generic
    const acronym = college.match(/\(([^)]+)\)/)[1].toLowerCase().replace('-', '');
    return `${acronym}_admin@cvsu.edu.ph`;
};

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const defaultPassword = await bcrypt.hash("DefaultPass123!", 10);

        for (const college of colleges) {
            const email = getEmail(college);
            const existing = await User.findOne({ email });
            if (existing) {
                console.log(`ℹ️ Admin for ${college} already exists.`);
            } else {
                const acronym = college.match(/\(([^)]+)\)/)[1];
                const newAdmin = new User({
                    fullName: `${acronym} Admin`,
                    email: email,
                    studentId: 'N/A',
                    college: college,
                    password: defaultPassword,
                    role: 'admin',
                    lastPasswordChange: null // forcing change on first login
                });
                await newAdmin.save();
                console.log(`✅ Created admin for ${college} (${email})`);
            }
        }

        mongoose.disconnect();
        console.log("Plug Disconnected");
    } catch (err) {
        console.error("❌ Link Error:", err);
    }
}

run();
