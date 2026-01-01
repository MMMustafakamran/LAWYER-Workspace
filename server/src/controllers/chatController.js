const Chat = require('../models/Chat');
const User = require('../models/User');

const getMessages = async (req, res) => {
    try {
        const { barId } = req.params;

        const messages = await Chat.find({ barId })
            .populate('senderId', '_id name')
            .sort({ createdAt: 1 });

        // Transform to match expected format
        const result = messages.map(msg => ({
            ...msg.toObject(),
            sender: msg.senderId
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find recent messages where user is sender or receiver
        const conversations = await Chat.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: userId },
                        { receiverId: userId },
                        { barId: { $regex: `_${userId}` } }
                    ]
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: '$barId',
                    message: { $first: '$message' },
                    senderId: { $first: '$senderId' },
                    receiverId: { $first: '$receiverId' },
                    createdAt: { $first: '$createdAt' }
                }
            }
        ]);

        // Map to conversation objects
        const result = await Promise.all(conversations.map(async (msg) => {
            let otherUser = null;

            // Determine other user
            if (msg.senderId?.toString() === userId) {
                if (msg.receiverId) {
                    otherUser = await User.findById(msg.receiverId).select('_id name role');
                } else if (msg._id) {
                    // Fallback parse barId
                    const parts = msg._id.split('_');
                    if (parts.length >= 3) {
                        const otherId = parts[1] == userId ? parts[2] : parts[1];
                        otherUser = await User.findById(otherId).select('_id name role');
                    }
                }
            } else {
                otherUser = await User.findById(msg.senderId).select('_id name role');
            }

            if (!otherUser) return null;

            return {
                roomId: msg._id,
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
