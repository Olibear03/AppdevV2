const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

async function findUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const users = await User.find({ studentId: "202202798" });
        console.log(`Users with studentId 202202798: ${users.length}`);
        users.forEach(u => console.log(JSON.stringify(u, null, 2)));

        const allStudents = await User.find({ role: 'student' }).limit(5);
        console.log("Example Students:");
        allStudents.forEach(u => console.log(`- ${u.fullName} (ID: ${u.studentId})`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findUser();
