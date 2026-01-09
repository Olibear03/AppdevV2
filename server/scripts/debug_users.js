const mongoose = require('mongoose');
const User = require('../models/User');
const fs = require('fs');
require('dotenv').config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({}, 'email role fullName');

        let output = '--- All Users ---\n';
        users.forEach(u => {
            output += `Email: ${u.email} | Role: ${u.role} | Name: ${u.fullName}\n`;
        });

        const superadmins = users.filter(u => u.role === 'superadmin');
        output += `\nFound ${superadmins.length} superadmin(s).\n`;

        fs.writeFileSync('scripts/users_dump.txt', output);
        console.log('Dump written to users_dump.txt');

        mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
};

checkUsers();
