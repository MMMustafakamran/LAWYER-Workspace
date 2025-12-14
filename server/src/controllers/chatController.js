const prisma = require('../utils/prisma');

const getMessages = async (req, res) => {
    try {
        const { barId } = req.params;

        const messages = await prisma.chat.findMany({
            where: { barId },
            include: {
                sender: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find recent messages where user is sender or receiver
        // Using distinct barId to get unique conversations
        const conversations = await prisma.chat.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }, // Support proper relation
                    { barId: { contains: `_${userId}` } } // Fallback for legacy
                ]
            },
            orderBy: { createdAt: 'desc' },
            distinct: ['barId'],
            include: {
                sender: { select: { id: true, name: true } },
                receiver: { select: { id: true, name: true } }
            }
        });

        // Map to conversation objects
        const result = await Promise.all(conversations.map(async (msg) => {
            let otherUser = null;

            // Determine other user
            if (msg.senderId === userId) {
                if (msg.receiver) {
                    otherUser = msg.receiver;
                } else if (msg.barId) {
                    // Fallback parse
                    const parts = msg.barId.split('_');
                    if (parts.length >= 3) {
                        const otherId = parseInt(parts[1] == userId ? parts[2] : parts[1]);
                        if (!isNaN(otherId)) {
                            otherUser = await prisma.user.findUnique({
                                where: { id: otherId },
                                select: { id: true, name: true, role: true }
                            });
                        }
                    }
                }
            } else {
                otherUser = msg.sender;
            }

            if (!otherUser) return null;

            return {
                roomId: msg.barId,
                otherUser,
                lastMessage: msg.message,
                timestamp: msg.createdAt
            };
        }));

        res.json(result.filter(c => c !== null));

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMessages,
    getConversations
};
