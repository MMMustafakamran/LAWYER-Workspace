// const fetch = require('node-fetch'); // Native fetch is available in Node 18+

async function testAuth() {
    try {
        // 1. Register
        console.log('Testing Registration...');
        const registerRes = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: `test${Date.now()}@example.com`,
                password: 'password123',
                role: 'LAWYER'
            })
        });

        const registerData = await registerRes.json();
        console.log('Register Response:', registerRes.status, registerData);

        if (registerRes.status !== 201) {
            throw new Error('Registration failed');
        }

        // 2. Login
        console.log('Testing Login...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: registerData.user.email,
                password: 'password123'
            })
        });

        const loginData = await loginRes.json();
        console.log('Login Response:', loginRes.status, loginData);

        if (loginRes.status !== 200) {
            throw new Error('Login failed');
        }

        console.log('Auth Test Passed!');
    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testAuth();
