const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const verify = async () => {
    const email = 'superadmin@cvsu.edu.ph';
    const passwordToCheck = 'admin123';

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User NOT found!');
            process.exit(1);
        }

        console.log(`Found User: ${user.email} | Role: ${user.role}`);

        const isMatch = await bcrypt.compare(passwordToCheck, user.password);
        console.log(`Password '${passwordToCheck}' match? -> ${isMatch ? 'YES ✅' : 'NO ❌'}`);

        mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
};

verify();
