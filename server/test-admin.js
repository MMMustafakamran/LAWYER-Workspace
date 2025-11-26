const axios = require('axios');
const prisma = require('./src/utils/prisma');

const API_URL = 'http://127.0.0.1:5000/api';

const testAdmin = async () => {
    try {
        // 1. Create/Get Admin User
        const adminEmail = 'admin@lawyerapp.com';
        const adminPassword = 'adminpassword';

        // Check if admin exists, if not create
        let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
        if (!admin) {
            console.log('Creating admin user...');
            // We need to hash password if we insert directly, but for test we can use auth route if we want
            // But easier to just update role of a created user or insert with known hash
            // Let's use the register endpoint then update role manually in DB
            try {
                await axios.post(`${API_URL}/auth/register`, {
                    name: 'System Admin',
                    email: adminEmail,
                    password: adminPassword,
                    role: 'LITIGANT' // Register as normal first
                });
            } catch (e) {
                // Ignore if already exists (though findUnique check should handle it)
            }

            // Update to SYSTEM_ADMIN
            admin = await prisma.user.update({
                where: { email: adminEmail },
                data: { role: 'SYSTEM_ADMIN' }
            });
        } else {
            // Ensure role is admin
            if (admin.role !== 'SYSTEM_ADMIN') {
                await prisma.user.update({
                    where: { email: adminEmail },
                    data: { role: 'SYSTEM_ADMIN' }
                });
            }
        }

        // 2. Login as Admin
        console.log('Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: adminEmail,
            password: adminPassword
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('Admin logged in.');

        // 3. Fetch Stats
        console.log('Fetching stats...');
        const statsRes = await axios.get(`${API_URL}/admin/stats`, config);
        console.log('Stats:', statsRes.data);

        // 4. Fetch Users
        console.log('Fetching users...');
        const usersRes = await axios.get(`${API_URL}/admin/users`, config);
        console.log(`Found ${usersRes.data.length} users.`);

        // 5. Test Access Denied (Create normal user)
        console.log('Testing access control...');
        const userEmail = 'normal@test.com';
        try {
            await axios.post(`${API_URL}/auth/register`, {
                name: 'Normal User',
                email: userEmail,
                password: 'password123',
                role: 'LITIGANT'
            });
        } catch (e) { }

        const userLoginRes = await axios.post(`${API_URL}/auth/login`, {
            email: userEmail,
            password: 'password123'
        });
        const userToken = userLoginRes.data.token;

        try {
            await axios.get(`${API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${userToken}` } });
            console.error('FAILED: Normal user was able to access admin stats!');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log('SUCCESS: Normal user denied access (403).');
            } else {
                console.error('FAILED: Unexpected error code:', error.response?.status);
            }
        }

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    } finally {
        await prisma.$disconnect();
    }
};

testAdmin();
