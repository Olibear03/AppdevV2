const mongoose = require('mongoose');
require('dotenv').config();
const Complaint = require('../models/Complaint');
const User = require('../models/User');

async function debugComplaints() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const complaints = await Complaint.find().sort({ createdAt: -1 }).limit(10);
        console.log(`Latest 10 complaints:`);

        complaints.forEach((c, i) => {
            console.log(`--- Complaint ${i} ---`);
            console.log('ID:', c._id);
            console.log('Title:', c.title);
            console.log('ImageUrls:', c.imageUrls);
            console.log('ImageUrl (old):', c.imageUrl);
            console.log('CreatedBy:', c.createdBy);
            console.log('---------------------');
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugComplaints();
