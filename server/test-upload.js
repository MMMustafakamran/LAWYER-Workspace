const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://127.0.0.1:5000/api';

async function testUpload() {
    try {
        // 1. Register a new user
        console.log('Registering new user...');
        const email = `testupload${Date.now()}@example.com`;
        const registerRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Upload Tester',
            email: email,
            password: 'password123',
            role: 'LAWYER'
        });
        const token = registerRes.data.token;
        console.log('Registration successful, token received.');

        // 2. Create a dummy file
        const filePath = path.join(__dirname, 'test-doc.txt');
        fs.writeFileSync(filePath, 'This is a test document content.');

        // 3. Create a case
        console.log('Creating a case...');
        const caseRes = await axios.post(`${API_URL}/cases`, {
            title: 'Upload Test Case',
            caseNumber: `UP-${Date.now()}`,
            court: 'High Court',
            type: 'Civil',
            status: 'OPEN'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const caseId = caseRes.data.id;
        console.log(`Case created with ID: ${caseId}`);

        // 4. Upload document
        console.log('Uploading document...');
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        const uploadRes = await axios.post(`${API_URL}/cases/${caseId}/documents`, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Upload successful:', uploadRes.data);

        // 5. Verify document is in case details
        console.log('Verifying case details...');
        const caseDetailRes = await axios.get(`${API_URL}/cases/${caseId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const docs = caseDetailRes.data.documents;
        if (docs && docs.length > 0) {
            console.log('Verification PASSED: Document found in case details.');
        } else {
            console.error('Verification FAILED: Document not found in case details.');
        }

        // Cleanup
        fs.unlinkSync(filePath);

    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        }
    }
}

testUpload();
