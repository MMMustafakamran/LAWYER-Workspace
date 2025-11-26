const axios = require('axios');
const io = require('socket.io-client');

const API_URL = 'http://127.0.0.1:5000/api';
const SOCKET_URL = 'http://127.0.0.1:5000';

const testPrivateChat = async () => {
    try {
        // 1. Register User A
        const emailA = `userA_${Date.now()}@test.com`;
        const resA = await axios.post(`${API_URL}/auth/register`, {
            name: 'User A',
            email: emailA,
            password: 'password123',
            role: 'LITIGANT'
        });
        const tokenA = resA.data.token;
        const idA = resA.data.user.id;
        console.log(`User A registered: ${idA}`);

        // 2. Register User B
        const emailB = `userB_${Date.now()}@test.com`;
        const resB = await axios.post(`${API_URL}/auth/register`, {
            name: 'User B',
            email: emailB,
            password: 'password123',
            role: 'LAWYER'
        });
        const tokenB = resB.data.token;
        const idB = resB.data.user.id;
        console.log(`User B registered: ${idB}`);

        // 3. User A sends message to User B via Socket
        const roomId = `private_${Math.min(idA, idB)}_${Math.max(idA, idB)}`;
        console.log(`Room ID: ${roomId}`);

        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('Socket connected');

            socket.emit('join_room', roomId);

            const messageData = {
                senderId: idA,
                message: 'Hello Lawyer B!',
                barId: roomId,
                sender: { name: 'User A' }
            };

            console.log('Sending message...');
            socket.emit('send_message', messageData);

            // Wait a bit for DB save
            setTimeout(async () => {
                socket.disconnect();

                // 4. User B fetches conversations
                console.log('User B fetching conversations...');
                const configB = { headers: { Authorization: `Bearer ${tokenB}` } };
                const convRes = await axios.get(`${API_URL}/chat/conversations`, configB);

                console.log(`User B has ${convRes.data.length} conversations.`);
                if (convRes.data.length > 0) {
                    console.log('First conversation with:', convRes.data[0].otherUser.name);
                    console.log('Last message:', convRes.data[0].lastMessage);
                }

                // 5. User B fetches history
                console.log('User B fetching history...');
                const histRes = await axios.get(`${API_URL}/chat/${roomId}`, configB);
                console.log(`Found ${histRes.data.length} messages in room.`);

            }, 2000);
        });

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
};

testPrivateChat();
