const mongoose = require('mongoose');
require('dotenv').config();
const Complaint = require('../models/Complaint');
const User = require('../models/User');

async function migrateComplaints() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const users = await User.find({ role: 'student' });
        console.log(`Checking ${users.length} students...`);

        let totalUpdated = 0;

        for (const user of users) {
            if (!user.studentId) continue;

            // Find all complaints with this studentId where createdBy is null
            const result = await Complaint.updateMany(
                { studentId: user.studentId, createdBy: null },
                { $set: { createdBy: user._id } }
            );

            if (result.matchedCount > 0) {
                console.log(`Updated ${result.modifiedCount} reports for student: ${user.studentId} (${user.fullName})`);
                totalUpdated += result.modifiedCount;
            }
        }

        console.log(`Migration finished. Total reports updated: ${totalUpdated}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrateComplaints();
