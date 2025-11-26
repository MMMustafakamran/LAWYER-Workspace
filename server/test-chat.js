const axios = require('axios');

const API_URL = 'http://127.0.0.1:5000/api';

const testChat = async () => {
    try {
        // 1. Login
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'test@example.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Fetch Messages (Initially empty or from previous tests)
        console.log('Fetching chat history for room "General"...');
        const historyRes = await axios.get(`${API_URL}/chat/General`, config);
        console.log(`Found ${historyRes.data.length} messages.`);

        // Note: We can't easily test Socket.io real-time events with a simple script without a socket client library,
        // but we can verify the REST API for history.

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
};

testChat();
