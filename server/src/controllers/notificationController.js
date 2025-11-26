const prisma = require('../utils/prisma');

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20 // Limit to recent 20
        });

        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await prisma.notification.updateMany({
            where: {
                id: parseInt(id),
                userId
            },
            data: { isRead: true }
        });

        res.json({ message: 'Marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createNotification = async (userId, message, type = 'INFO') => {
    try {
        await prisma.notification.create({
            data: {
                userId,
                message,
                type
            }
        });
    } catch (error) {
        console.error('Failed to create notification', error);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    createNotification
};
