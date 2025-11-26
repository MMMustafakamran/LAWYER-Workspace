// const fetch = require('node-fetch');

async function testCase() {
    try {
        const email = `lawyer${Date.now()}@example.com`;
        const password = 'password123';

        // 1. Register Lawyer
        console.log('Registering Lawyer...');
        const registerRes = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Lawyer',
                email,
                password,
                role: 'LAWYER'
            })
        });
        const registerData = await registerRes.json();
        const token = registerData.token;

        if (!token) throw new Error('Registration failed');

        // 2. Create Case
        console.log('Creating Case...');
        const caseRes = await fetch('http://localhost:5000/api/cases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'State vs. John Doe',
                caseNumber: 'CR-2023-001',
                court: 'High Court',
                type: 'Criminal',
                status: 'OPEN',
                nextHearingDate: '2023-12-01'
            })
        });
        const caseData = await caseRes.json();
        console.log('Create Case Response:', caseRes.status, caseData);

        if (caseRes.status !== 201) throw new Error('Case creation failed');

        // 3. Get Cases
        console.log('Getting Cases...');
        const getRes = await fetch('http://localhost:5000/api/cases', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const cases = await getRes.json();
        console.log('Get Cases Response:', getRes.status, cases.length, 'cases found');

        if (getRes.status !== 200 || cases.length === 0) throw new Error('Get cases failed');

        console.log('Case Test Passed!');
    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testCase();
