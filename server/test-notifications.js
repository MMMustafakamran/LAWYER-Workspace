const axios = require('axios');
const prisma = require('./src/utils/prisma'); // We can use prisma here if we run from server dir

const API_URL = 'http://127.0.0.1:5000/api';

const testNotifications = async () => {
    try {
        // 1. Login
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'test@example.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        const userId = loginRes.data.user.id;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Create a notification manually (since we don't have a public endpoint for it)
        // We'll use the controller function if we could import it, but we can't easily import controller in script without mocking req/res
        // So we'll insert directly via Prisma (since we are in server dir)

        console.log('Creating test notification...');
        await prisma.notification.create({
            data: {
                userId,
                message: 'Test Notification ' + Date.now(),
                type: 'INFO'
            }
        });
        console.log('Notification created.');

        // 3. Fetch Notifications
        console.log('Fetching notifications...');
        const res = await axios.get(`${API_URL}/notifications`, config);
        console.log(`Found ${res.data.length} notifications.`);

        if (res.data.length > 0) {
            const notifId = res.data[0].id;
            console.log('First notification:', res.data[0].message);

            // 4. Mark as Read
            console.log('Marking as read...');
            await axios.put(`${API_URL}/notifications/${notifId}/read`, {}, config);
            console.log('Marked as read.');
        }

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    } finally {
        await prisma.$disconnect();
    }
};

testNotifications();
