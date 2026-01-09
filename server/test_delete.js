const axios = require('axios');

// Test script to verify delete endpoint
const API_URL = 'http://192.168.18.5:4000';

async function testDelete() {
    try {
        // First, get a token by logging in
        console.log('1. Logging in as superadmin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'superadmin@cvsu.edu.ph', // Adjust if different
            password: 'admin123' // Adjust if different
        });

        const token = loginRes.data.token;
        console.log('✓ Login successful, token received');

        // Get list of complaints
        console.log('\n2. Fetching complaints...');
        const complaintsRes = await axios.get(`${API_URL}/complaints`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`✓ Found ${complaintsRes.data.length} complaints`);

        if (complaintsRes.data.length === 0) {
            console.log('⚠ No complaints to delete. Create one first.');
            return;
        }

        const firstComplaint = complaintsRes.data[0];
        console.log(`\n3. Attempting to delete complaint: ${firstComplaint._id}`);
        console.log(`   Title: ${firstComplaint.title}`);

        const deleteRes = await axios.delete(`${API_URL}/complaints/${firstComplaint._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`✓ Delete successful!`);
        console.log(`  Status: ${deleteRes.status}`);
        console.log(`  Response:`, deleteRes.data);

        // Verify it's gone
        console.log('\n4. Verifying deletion...');
        const verifyRes = await axios.get(`${API_URL}/complaints`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const stillExists = verifyRes.data.find(c => c._id === firstComplaint._id);
        if (stillExists) {
            console.log('✗ PROBLEM: Complaint still exists in database!');
        } else {
            console.log('✓ Confirmed: Complaint successfully deleted from database');
        }

    } catch (err) {
        console.error('\n✗ ERROR:', err.response?.data || err.message);
        console.error('Status:', err.response?.status);
    }
}

testDelete();
