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

        // Find all unique barIds (rooms) where the user is a sender
        // In a real app, you'd have a separate Conversation model, but we'll infer from messages for now
        // Or better, we define room ID as "min(id1, id2)_max(id1, id2)" for 1-on-1

        // Fetch distinct barIds from messages sent or received by user
        // Prisma doesn't support distinct on non-native fields easily in all versions, 
        // so we'll fetch recent messages and aggregate manually or use raw query.
        // For simplicity in this prototype:

        const sentMessages = await prisma.chat.findMany({
            where: { senderId: userId },
            distinct: ['barId'],
            select: { barId: true }
        });

        // We also need to find messages where user is receiver, but our Chat model doesn't have receiverId explicit
        // We rely on barId being "user1_user2".
        // Let's assume barId format for private chat is "private_ID1_ID2" (sorted)

        // A better approach for this feature request:
        // 1. When starting a chat, we use a consistent room ID.
        // 2. We search for all messages where barId contains the user's ID.

        const allMessages = await prisma.chat.findMany({
            where: {
                barId: {
                    contains: `_${userId}` // Hacky but works if ID is in the string
                }
            },
            orderBy: { createdAt: 'desc' },
            distinct: ['barId'],
            include: {
                sender: { select: { id: true, name: true } }
            }
        });

        // Parse barId to find the "other" user
        const conversations = await Promise.all(allMessages.map(async (msg) => {
            const parts = msg.barId.split('_');
            if (parts[0] !== 'private') return null; // Skip non-private rooms

            const otherId = parts[1] == userId ? parts[2] : parts[1];

            const otherUser = await prisma.user.findUnique({
                where: { id: parseInt(otherId) },
                select: { id: true, name: true, role: true }
            });

            return {
                roomId: msg.barId,
                otherUser,
                lastMessage: msg.message,
                timestamp: msg.createdAt
            };
        }));

        res.json(conversations.filter(c => c !== null));

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMessages,
    getConversations
};
