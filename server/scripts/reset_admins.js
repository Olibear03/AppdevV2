const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const admins = [
    { college: 'CEIT', email: 'ceit_admin@cvsu.edu.ph', name: 'CEIT Admin' },
    { college: 'CAS', email: 'cas_admin@cvsu.edu.ph', name: 'CAS Admin' },
    { college: 'CAFENR', email: 'cafenr_admin@cvsu.edu.ph', name: 'CAFENR Admin' },
    { college: 'CCJ', email: 'ccj_admin@cvsu.edu.ph', name: 'CCJ Admin' },
    { college: 'CEMDS', email: 'cemds_admin@cvsu.edu.ph', name: 'CEMDS Admin' },
    { college: 'CED', email: 'ced_admin@cvsu.edu.ph', name: 'CED Admin' },
    { college: 'CON', email: 'con_admin@cvsu.edu.ph', name: 'CON Admin' },
    { college: 'CSPEAR', email: 'cspear_admin@cvsu.edu.ph', name: 'CSPEAR Admin' },
    { college: 'CTHM', email: 'cthm_admin@cvsu.edu.ph', name: 'CTHM Admin' },
    { college: 'CVMBS', email: 'cvmbs_admin@cvsu.edu.ph', name: 'CVMBS Admin' },
    { college: 'COM', email: 'com_admin@cvsu.edu.ph', name: 'COM Admin' },
    { college: 'GS-OLC', email: 'gsolc_admin@cvsu.edu.ph', name: 'GS-OLC Admin' }
];

const resetAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Delete all existing admins
        const deleteRes = await User.deleteMany({ role: 'admin' });
        console.log(`Deleted ${deleteRes.deletedCount} existing admins.`);

        // 2. Create new admins
        const hashedPassword = await bcrypt.hash('admin123', 10);

        for (const admin of admins) {
            const newUser = new User({
                fullName: admin.name,
                email: admin.email,
                password: hashedPassword,
                role: 'admin',
                college: admin.college,
                studentId: 'N/A'
            });
            await newUser.save();
            console.log(`Created: ${admin.college} -> ${admin.email}`);
        }

        console.log('\n✅ All admins reset successfully.');
        console.log('Default Password: admin123');

        mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
};

resetAdmins();
