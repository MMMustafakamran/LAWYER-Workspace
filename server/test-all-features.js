// Comprehensive API Test Script
require('dotenv').config({ path: './database_env.env' });

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testUserId = '';

// Simple fetch wrapper
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
    console.log('   LAWYER APP - FEATURE TEST SUITE');
    console.log('========================================\n');

    // =====================
    // 1. AUTH MODULE
    // =====================
    console.log('📋 Testing AUTH Module...');
    
    await test('Auth: Login with valid credentials', async () => {
        const res = await api('POST', '/auth/login', {
            email: 'lawyer@test.com',
            password: 'password123'
        });
        if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
        authToken = res.data.token;
        testUserId = res.data.user.id;
        if (!authToken) throw new Error('No token received');
    });

    await test('Auth: Register new user', async () => {
        const res = await api('POST', '/auth/register', {
            name: 'Test User',
            email: `test_${Date.now()}@test.com`,
            password: 'password123',
            role: 'LITIGANT'
        });
        if (res.status !== 201) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    });

    // =====================
    // 2. LAWYER DIRECTORY
    // =====================
    console.log('📋 Testing LAWYER DIRECTORY Module...');

    await test('Lawyers: Get all lawyers', async () => {
        const res = await api('GET', '/lawyers');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
        if (!Array.isArray(res.data)) throw new Error('Expected array');
    });

    await test('Lawyers: Get lawyer by ID', async () => {
        const listRes = await api('GET', '/lawyers');
        if (listRes.data.length === 0) throw new Error('No lawyers to test');
        const lawyerId = listRes.data[0]._id;
        const res = await api('GET', `/lawyers/${lawyerId}`);
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('Lawyers: Update lawyer profile', async () => {
        const res = await api('PUT', '/lawyers/profile', {
            specialization: 'Criminal',
            experience: 12,
            bio: 'Updated bio',
            location: 'Islamabad',
            hourlyRate: 6000
        });
        if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    });

    // =====================
    // 3. CASE MANAGEMENT
    // =====================
    console.log('📋 Testing CASE MANAGEMENT Module...');

    let testCaseId = '';
    await test('Cases: Create new case', async () => {
        const res = await api('POST', '/cases', {
            title: 'Test Case v. State',
            caseNumber: 'TC-2026-001',
            court: 'Lahore High Court',
            type: 'Criminal',
            status: 'OPEN',
            nextHearingDate: '2026-02-15'
        });
        if (res.status !== 201) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
        testCaseId = res.data._id;
    });

    await test('Cases: Get my cases', async () => {
        const res = await api('GET', '/cases');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
        if (!Array.isArray(res.data)) throw new Error('Expected array');
    });

    await test('Cases: Get case by ID', async () => {
        if (!testCaseId) throw new Error('No case ID from previous test');
        const res = await api('GET', `/cases/${testCaseId}`);
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    // =====================
    // 4. LEGAL RESEARCH
    // =====================
    console.log('📋 Testing LEGAL RESEARCH Module...');

    await test('Laws: Get all laws', async () => {
        const res = await api('GET', '/laws');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
        if (!Array.isArray(res.data)) throw new Error('Expected array');
    });

    await test('Laws: Search laws by query', async () => {
        const res = await api('GET', '/laws/search?query=criminal');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('Laws: Filter by category', async () => {
        const res = await api('GET', '/laws/search?category=Criminal');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    // =====================
    // 5. MARKETPLACE
    // =====================
    console.log('📋 Testing MARKETPLACE Module...');

    await test('Marketplace: Get all items', async () => {
        const res = await api('GET', '/marketplace');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
        if (!Array.isArray(res.data)) throw new Error('Expected array');
    });

    await test('Marketplace: Create item', async () => {
        const res = await api('POST', '/marketplace', {
            name: 'Test Law Book',
            description: 'A test item',
            price: 1500,
            imageUrl: 'https://example.com/book.jpg'
        });
        if (res.status !== 201) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    });

    // =====================
    // 6. APPOINTMENTS
    // =====================
    console.log('📋 Testing APPOINTMENTS Module...');

    await test('Appointments: Get my appointments', async () => {
        const res = await api('GET', '/appointments');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    // =====================
    // 7. CHAT
    // =====================
    console.log('📋 Testing CHAT Module...');

    await test('Chat: Get conversations', async () => {
        const res = await api('GET', '/chat/conversations');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    // =====================
    // 8. NOTIFICATIONS
    // =====================
    console.log('📋 Testing NOTIFICATIONS Module...');

    await test('Notifications: Get notifications', async () => {
        const res = await api('GET', '/notifications');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    // =====================
    // 9. POLLS/ELECTIONS
    // =====================
    console.log('📋 Testing ELECTIONS Module...');

    await test('Polls: Get all polls', async () => {
        const res = await api('GET', '/polls');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    await test('Polls: Create poll (as lawyer)', async () => {
        const res = await api('POST', '/polls', {
            question: 'Who should be the next Bar President?',
            barType: 'Lahore Bar',
            candidateList: ['Ali Khan', 'Sara Ahmed', 'Usman Malik'],
            endDate: '2026-03-01'
        });
        if (res.status !== 201) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    });

    // =====================
    // 10. ORDERS
    // =====================
    console.log('📋 Testing ORDERS Module...');

    await test('Orders: Get my orders', async () => {
        const res = await api('GET', '/orders');
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    // =====================
    // 11. ADMIN
    // =====================
    console.log('📋 Testing ADMIN Module...');

    // Login as admin first
    const adminRes = await api('POST', '/auth/login', {
        email: 'admin@test.com',
        password: 'password123'
    });
    const adminToken = adminRes.data.token;

    await test('Admin: Get stats', async () => {
        const res = await api('GET', '/admin/stats', null, adminToken);
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
        if (!res.data.users && res.data.users !== 0) throw new Error('Missing stats');
    });

    await test('Admin: Get all users', async () => {
        const res = await api('GET', '/admin/users', null, adminToken);
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
        if (!Array.isArray(res.data)) throw new Error('Expected array');
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
