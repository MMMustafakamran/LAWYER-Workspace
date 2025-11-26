const axios = require('axios');

const API_URL = 'http://127.0.0.1:5000/api';

const testLawyerDirectory = async () => {
    try {
        // 1. Register a new Lawyer
        const email = `lawyer_${Date.now()}@test.com`;
        console.log(`Registering lawyer: ${email}`);

        let token;
        try {
            const regRes = await axios.post(`${API_URL}/auth/register`, {
                name: 'Test Lawyer',
                email,
                password: 'password123',
                role: 'LAWYER'
            });
            token = regRes.data.token;
        } catch (e) {
            console.error('Registration failed', e.response?.data);
            return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Update Profile
        console.log('Updating profile...');
        await axios.put(`${API_URL}/lawyers/profile`, {
            specialization: 'Criminal',
            experience: 10,
            bio: 'Expert in criminal defense.',
            location: 'Lahore',
            hourlyRate: 150
        }, config);
        console.log('Profile updated.');

        // 3. Get All Lawyers
        console.log('Fetching lawyer directory...');
        const listRes = await axios.get(`${API_URL}/lawyers`, config);
        console.log(`Found ${listRes.data.length} lawyers.`);

        // 4. Get Lawyer Profile
        const lawyerId = listRes.data[0].id;
        console.log(`Fetching profile for lawyer ID: ${lawyerId}`);
        const profileRes = await axios.get(`${API_URL}/lawyers/${lawyerId}`, config);
        console.log('Lawyer Name:', profileRes.data.name);
        console.log('Specialization:', profileRes.data.lawyerProfile?.specialization);

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
};

testLawyerDirectory();
