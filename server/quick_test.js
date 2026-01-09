const axios = require('axios');

// Simple test to verify delete works
const API_URL = 'http://localhost:4000';

async function quickDeleteTest() {
    try {
        console.log('🧪 Testing Delete Functionality\n');

        // Step 1: Login as superadmin
        console.log('1️⃣ Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'superadmin@cvsu.edu.ph',
            password: 'superadmin123'
        });

        const token = loginRes.data.token;
        console.log('   ✅ Logged in successfully\n');

        // Step 2: Get complaints
        console.log('2️⃣ Fetching complaints...');
        const complaintsRes = await axios.get(`${API_URL}/complaints`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`   ✅ Found ${complaintsRes.data.length} complaints\n`);

        if (complaintsRes.data.length === 0) {
            console.log('   ⚠️  No complaints to test with. Please create one first.');
            return;
        }

        const testComplaint = complaintsRes.data[0];
        console.log(`3️⃣ Testing delete on complaint:`);
        console.log(`   ID: ${testComplaint._id}`);
        console.log(`   Title: ${testComplaint.title || 'No title'}\n`);

        // Step 3: Delete
        console.log('4️⃣ Sending DELETE request...');
        const deleteRes = await axios.delete(`${API_URL}/complaints/${testComplaint._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`   ✅ DELETE successful!`);
        console.log(`   Status: ${deleteRes.status}`);
        console.log(`   Response:`, deleteRes.data, '\n');

        // Step 4: Verify
        console.log('5️⃣ Verifying deletion...');
        const verifyRes = await axios.get(`${API_URL}/complaints`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const stillExists = verifyRes.data.find(c => c._id === testComplaint._id);

        if (stillExists) {
            console.log('   ❌ FAILED: Complaint still exists in database!');
        } else {
            console.log(`   ✅ SUCCESS: Complaint deleted from database!`);
            console.log(`   Complaints remaining: ${verifyRes.data.length}\n`);
            console.log('🎉 DELETE FUNCTIONALITY WORKS PERFECTLY!\n');
        }

    } catch (err) {
        console.error('\n❌ ERROR:');
        console.error('Message:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        }
    }
}

quickDeleteTest();
