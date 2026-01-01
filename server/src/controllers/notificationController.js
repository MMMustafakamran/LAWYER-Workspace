const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20);

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

        await Notification.findOneAndUpdate(
            { _id: id, userId },
            { isRead: true }
        );

        res.json({ message: 'Marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createNotification = async (userId, message, type = 'INFO') => {
    try {
        await Notification.create({
            userId,
            message,
            type
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
