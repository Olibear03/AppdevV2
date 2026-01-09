const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:4000'; // Adjust port if needed

const testDelete = async () => {
    try {
        // 1. Login as Superadmin
        console.log('Logging in as Superadmin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'superadmin@cvsu.edu.ph',
            password: 'admin123',
            role: 'superadmin'
        });
        const token = loginRes.data.token;
        console.log('✅ Logged in. Token received.');

        // 2. Create Dummy User to Delete
        // We'll create an admin via the create-admin route
        const dummyEmail = `delete_me_${Date.now()}@cvsu.edu.ph`;
        console.log(`Creating dummy user: ${dummyEmail}...`);

        let createdUserId;
        try {
            const createRes = await axios.post(
                `${API_URL}/auth/create-admin`,
                {
                    fullName: 'Delete Me',
                    email: dummyEmail,
                    password: 'password123',
                    college: 'Test College'
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            createdUserId = createRes.data.admin._id;
            console.log(`✅ Dummy user created. ID: ${createdUserId}`);
        } catch (err) {
            console.error('❌ Failed to create dummy user:', err.response?.data || err.message);
            return;
        }

        // 3. Delete Dummy User
        console.log(`Deleting user ${createdUserId}...`);
        const deleteRes = await axios.delete(
            `${API_URL}/auth/users/${createdUserId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Response:', deleteRes.data);
        console.log('✅ Delete successful!');

    } catch (err) {
        console.error('❌ Test Failed:', err.response?.data || err.message);
    }
};

testDelete();
