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
            const { senderId, message, barId } = data;

            // Save to database
            try {
                const savedMessage = await prisma.chat.create({
                    data: {
                        senderId,
                        message,
                        barId
                    },
                    include: {
                        sender: {
                            select: { name: true }
                        }
                    }
                });

                // Broadcast to room (barId is used as room)
                io.to(barId).emit('receive_message', savedMessage);
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
