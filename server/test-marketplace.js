const axios = require('axios');

const API_URL = 'http://127.0.0.1:5000/api';

const testMarketplace = async () => {
    try {
        // 1. Login/Register as Vendor
        const email = `vendor_${Date.now()}@test.com`;
        console.log(`Registering vendor: ${email}`);

        let token;
        try {
            const regRes = await axios.post(`${API_URL}/auth/register`, {
                name: 'Test Vendor',
                email,
                password: 'password123',
                role: 'VENDOR'
            });
            token = regRes.data.token;
        } catch (e) {
            console.error('Registration failed', e.response?.data);
            return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Create Item
        console.log('Creating item...');
        await axios.post(`${API_URL}/marketplace`, {
            name: 'Legal Contract Template',
            description: 'Standard NDA template.',
            price: 49.99
        }, config);
        console.log('Item created.');

        // 3. Get Items
        console.log('Fetching marketplace items...');
        const listRes = await axios.get(`${API_URL}/marketplace`, config);
        console.log(`Found ${listRes.data.length} items.`);
        if (listRes.data.length > 0) {
            console.log('First item:', listRes.data[0].name);
        }

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
};

testMarketplace();
