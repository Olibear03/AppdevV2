const mongoose = require('mongoose');
require('dotenv').config();
const Complaint = require('../models/Complaint');

async function countAll() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Complaint.countDocuments();
        console.log("Total complaints in database:", count);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
countAll();
