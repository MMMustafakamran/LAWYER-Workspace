const axios = require('axios');

const API_URL = 'http://127.0.0.1:5000/api';

const testElections = async () => {
    try {
        // 1. Login as Lawyer (to create poll)
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'test@example.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Create Poll
        console.log('Creating election...');
        const pollRes = await axios.post(`${API_URL}/polls`, {
            question: 'Annual Bar President Election 2025',
            barType: 'Lahore High Court Bar',
            candidateList: ['Candidate A', 'Candidate B'],
            endDate: new Date(Date.now() + 86400000).toISOString() // Tomorrow
        }, config);
        console.log('Election created:', pollRes.data.question);
        const pollId = pollRes.data.id;

        // 3. Vote
        console.log('Voting for Candidate A...');
        await axios.post(`${API_URL}/polls/vote`, {
            pollId,
            choice: 'Candidate A'
        }, config);
        console.log('Vote cast successfully.');

        // 4. Get Results
        console.log('Fetching results...');
        const resultsRes = await axios.get(`${API_URL}/polls`, config);
        const poll = resultsRes.data.find(p => p.id === pollId);
        console.log('Results:', poll.results);

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
};

testElections();
