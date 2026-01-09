const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetPassword = async () => {
    const email = 'superadmin@cvsu.edu.ph';
    const newPassword = 'admin123';

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        console.log(`Password for ${email} has been reset to: ${newPassword}`);

        mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
};

resetPassword();
