const mongoose = require('mongoose');
require('dotenv').config();
const Complaint = require('../models/Complaint');

async function listIds() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const ids = await Complaint.distinct("studentId");
        console.log("Unique Student IDs in Complaints:", ids);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
listIds();
