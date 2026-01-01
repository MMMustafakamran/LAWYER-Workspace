const socketIo = require('socket.io');
const Chat = require('../models/Chat');
const Notification = require('../models/Notification');
const User = require('../models/User');

let io;

const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join_room', (room) => {
            socket.join(room);
            console.log(`User joined room: ${room}`);
        });

        socket.on('send_message', async (data) => {
            const { senderId, receiverId, message, barId } = data;

            // Save to database
            try {
                const savedMessage = await Chat.create({
                    senderId,
                    receiverId,
                    message,
                    barId
                });

                // Get sender info
                const sender = await User.findById(senderId).select('name');
                const messageWithSender = {
                    ...savedMessage.toObject(),
                    sender: { name: sender?.name }
                };

                // Broadcast to chat room
                io.to(barId).emit('receive_message', messageWithSender);

                // Notify receiver if they are in their personal room
                if (receiverId) {
                    // Send a notification event
                    io.to(`user_${receiverId}`).emit('new_notification', {
                        type: 'MESSAGE',
                        message: `New message from ${sender?.name}`,
                        conversationId: barId,
                        data: messageWithSender
                    });

                    // Persist notification
                    await Notification.create({
                        userId: receiverId,
                        message: `New message from ${sender?.name}`,
                        type: 'MESSAGE'
                    });
                }
            } catch (error) {
                console.error('Error saving message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = { initSocket, getIo };
