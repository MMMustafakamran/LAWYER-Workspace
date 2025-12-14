const socketIo = require('socket.io');
const prisma = require('../utils/prisma');

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
                const savedMessage = await prisma.chat.create({
                    data: {
                        senderId,
                        receiverId,
                        message,
                        barId
                    },
                    include: {
                        sender: {
                            select: { name: true }
                        }
                    }
                });

                // Broadcast to chat room
                io.to(barId).emit('receive_message', savedMessage);

                // Notify receiver if they are in their personal room
                if (receiverId) {
                    // Send a notification event
                    io.to(`user_${receiverId}`).emit('new_notification', {
                        type: 'MESSAGE',
                        message: `New message from ${savedMessage.sender.name}`,
                        conversationId: barId,
                        data: savedMessage
                    });

                    // Persist notification
                    await prisma.notification.create({
                        data: {
                            userId: receiverId,
                            message: `New message from ${savedMessage.sender.name}`,
                            type: 'MESSAGE'
                        }
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
