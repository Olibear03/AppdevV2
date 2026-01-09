const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

async function checkTypo() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: "Oliver@cvsu.du.ph" });
        if (user) {
            console.log("Found user with typo!");
            console.log(JSON.stringify(user, null, 2));
        } else {
            console.log("No user with Oliver@cvsu.du.ph");
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkTypo();
