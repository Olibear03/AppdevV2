const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkConnection() {
    console.log('🔌 Testing MongoDB Connection...');
    console.log('Target:', process.env.MONGO_URI ? 'URI Found' : 'URI Missing');

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connection Successful!');
        console.log('Host:', mongoose.connection.host);
        console.log('Database:', mongoose.connection.name);
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        process.exit(1);
    }
}

checkConnection();
