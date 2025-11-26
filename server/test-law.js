const axios = require('axios');

const API_URL = 'http://127.0.0.1:5000/api';

// Login to get token
const login = async () => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'test@example.com', // Assuming this user exists from previous tests
            password: 'password123'
        });
        return response.data.token;
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        // Try registering if login fails
        try {
            const regResponse = await axios.post(`${API_URL}/auth/register`, {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'LAWYER'
            });
            return regResponse.data.token;
        } catch (regError) {
            console.error('Registration failed:', regError.response?.data || regError.message);
            return null;
        }
    }
};

const testLaws = async () => {
    const token = await login();
    if (!token) {
        console.log('Skipping law tests due to auth failure');
        return;
    }

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    try {
        // 1. Seed Laws
        console.log('Seeding laws...');
        await axios.post(`${API_URL}/laws/seed`, {}, config);
        console.log('Laws seeded.');

        // 2. Search Laws
        console.log('Searching for "Penal"...');
        const searchRes = await axios.get(`${API_URL}/laws/search?query=Penal`, config);
        console.log('Search Results:', searchRes.data.length);
        if (searchRes.data.length > 0) {
            console.log('First result:', searchRes.data[0].title);
        }

        // 3. Get All Laws
        console.log('Getting all laws...');
        const allRes = await axios.get(`${API_URL}/laws`, config);
        console.log('Total laws:', allRes.data.length);

    } catch (error) {
        console.error('Law test failed:', error.response?.data || error.message);
    }
};

testLaws();
