const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Complaint = require('../models/Complaint');

async function debugUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const email = "Oliver@cvsu.edu.ph";
        const user = await User.findOne({ email });

        if (!user) {
            console.log("User not found!");
        } else {
            console.log("--- USER PROFILE ---");
            console.log(JSON.stringify(user, null, 2));

            const byCreated = await Complaint.find({ createdBy: user._id });
            console.log(`Complaints by createdBy (${user._id}): ${byCreated.length}`);

            if (user.studentId) {
                const byStudentId = await Complaint.find({ studentId: user.studentId });
                console.log(`Complaints by studentId (${user.studentId}): ${byStudentId.length}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugUser();
