// Comprehensive API Test Script - All Features
require('dotenv').config({ path: './database_env.env' });

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let lawyerToken = '';
let testCaseId = '';
let testItemId = '';

const api = async (method, endpoint, body = null, token = authToken) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    if (body) options.body = JSON.stringify(body);
    
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json().catch(() => ({ error: 'No JSON response' }));
    return { status: res.status, data };
};

const testResults = [];

const test = async (name, fn) => {
    try {
        await fn();
        testResults.push({ name, status: '✅ PASS' });
    } catch (error) {
        testResults.push({ name, status: '❌ FAIL', error: error.message });
    }
};

const runTests = async () => {
    console.log('\n========================================');
    console.log('   COMPLETE FEATURE TEST SUITE');
    console.log('========================================\n');

    // Login
    console.log('📋 Setting up test tokens...');
    const loginRes = await api('POST', '/auth/login', { email: 'lawyer@test.com', password: 'password123' });
    lawyerToken = loginRes.data.token;
    authToken = lawyerToken;

    const clientRes = await api('POST', '/auth/login', { email: 'client@test.com', password: 'password123' });
    const clientToken = clientRes.data.token;

    // =====================
    // CASE MANAGEMENT - NEW FEATURES
    // =====================
    console.log('📋 Testing CASE MANAGEMENT (New Features)...');

    await test('Cases: Search cases', async () => {
        const res = await api('GET', '/cases/search?query=test');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('Cases: Create case for testing', async () => {
        const res = await api('POST', '/cases', {
            title: 'Feature Test Case',
            caseNumber: 'FTC-2026-001',
            court: 'Supreme Court',
            type: 'Criminal',
            status: 'OPEN'
        });
        if (res.status !== 201) throw new Error(`Status ${res.status}`);
        testCaseId = res.data._id;
    });

    await test('Cases: Add note to case', async () => {
        if (!testCaseId) throw new Error('No case ID');
        const res = await api('POST', `/cases/${testCaseId}/notes`, {
            content: 'This is a test note for the case'
        });
        if (res.status !== 201) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    });

    await test('Cases: Update case status', async () => {
        if (!testCaseId) throw new Error('No case ID');
        const res = await api('PATCH', `/cases/${testCaseId}/status`, { status: 'IN_PROGRESS' });
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('Cases: Share case with user', async () => {
        if (!testCaseId) throw new Error('No case ID');
        const res = await api('POST', `/cases/${testCaseId}/share`, { email: 'client@test.com' });
        if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    });

    // =====================
    // LAWYER HIRING - NEW FEATURES
    // =====================
    console.log('📋 Testing LAWYER HIRING (New Features)...');

    await test('Lawyers: Toggle hiring availability', async () => {
        const res = await api('POST', '/lawyers/toggle-hiring');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('Lawyers: Filter by available only', async () => {
        const res = await api('GET', '/lawyers?availableOnly=true');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('Lawyers: Hire a lawyer (as client)', async () => {
        const lawyerList = await api('GET', '/lawyers');
        const lawyerId = lawyerList.data[0]._id;
        
        const res = await api('POST', '/lawyers/hire', {
            lawyerId,
            message: 'I need legal help',
            caseType: 'Criminal',
            budget: 50000
        }, clientToken);
        if (res.status !== 201 && res.status !== 400) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    });

    await test('Lawyers: Get hiring requests', async () => {
        const res = await api('GET', '/lawyers/hiring-requests');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    // =====================
    // MARKETPLACE - NEW FEATURES
    // =====================
    console.log('📋 Testing MARKETPLACE (New Features)...');

    await test('Marketplace: Search items', async () => {
        const res = await api('GET', '/marketplace?search=book');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('Marketplace: Create item for testing', async () => {
        const res = await api('POST', '/marketplace', {
            name: 'Test Legal Book',
            description: 'A book for testing',
            price: 1000
        });
        if (res.status !== 201) throw new Error(`Status ${res.status}`);
        testItemId = res.data._id;
    });

    await test('Marketplace: Get item by ID', async () => {
        if (!testItemId) throw new Error('No item ID');
        const res = await api('GET', `/marketplace/item/${testItemId}`);
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('Marketplace: Get my items (seller dashboard)', async () => {
        const res = await api('GET', '/marketplace/my-items');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('Marketplace: Get seller stats', async () => {
        const res = await api('GET', '/marketplace/seller-stats');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('Marketplace: Add to cart', async () => {
        if (!testItemId) throw new Error('No item ID');
        const res = await api('POST', '/marketplace/cart', { itemId: testItemId });
        if (res.status !== 201) throw new Error(`Status ${res.status}`);
    });

    await test('Marketplace: Get cart', async () => {
        const res = await api('GET', '/marketplace/cart');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
        if (!res.data.items) throw new Error('No items in response');
    });

    await test('Marketplace: Checkout', async () => {
        const res = await api('POST', '/marketplace/checkout', { paymentMethod: 'COD' });
        if (res.status !== 201) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    });

    // =====================
    // PROFILE - NEW FEATURES
    // =====================
    console.log('📋 Testing PROFILE (New Features)...');

    await test('Profile: Get profile', async () => {
        const res = await api('GET', '/profile');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('Profile: Update profile', async () => {
        const res = await api('PUT', '/profile', { phone: '03001112222' });
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('Profile: Update language', async () => {
        const res = await api('PUT', '/profile/language', { language: 'ur' });
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    // =====================
    // EXISTING FEATURES (Regression)
    // =====================
    console.log('📋 Testing EXISTING FEATURES (Regression)...');

    await test('Laws: Get all', async () => {
        const res = await api('GET', '/laws');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('Polls: Get all', async () => {
        const res = await api('GET', '/polls');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('Notifications: Get', async () => {
        const res = await api('GET', '/notifications');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('Appointments: Get', async () => {
        const res = await api('GET', '/appointments');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('Orders: Get', async () => {
        const res = await api('GET', '/orders');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('Admin: Get stats', async () => {
        const adminRes = await api('POST', '/auth/login', { email: 'admin@test.com', password: 'password123' });
        const res = await api('GET', '/admin/stats', null, adminRes.data.token);
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    // =====================
    // PRINT RESULTS
    // =====================
    console.log('\n========================================');
    console.log('            TEST RESULTS');
    console.log('========================================\n');

    const passed = testResults.filter(t => t.status.includes('PASS')).length;
    const failed = testResults.filter(t => t.status.includes('FAIL')).length;

    testResults.forEach(t => {
        console.log(`${t.status} ${t.name}`);
        if (t.error) console.log(`   └─ ${t.error}`);
    });

    console.log('\n----------------------------------------');
    console.log(`Total: ${testResults.length} | Passed: ${passed} | Failed: ${failed}`);
    console.log('----------------------------------------\n');

    process.exit(failed > 0 ? 1 : 0);
};

runTests();
