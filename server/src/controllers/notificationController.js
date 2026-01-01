const Notification = require('../models/Notification');

const Case = require('../models/Case');
const Appointment = require('../models/Appointment');

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch stored notifications
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean(); // Use lean to allow modification

        // 2. Dynamic Hearings Check (Today & Tomorrow)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(dayAfter.getDate() + 1);

        const upcomingCases = await Case.find({
            $or: [{ lawyerId: userId }, { clientId: userId }],
            nextHearingDate: { $gte: today, $lt: dayAfter } // Today or Tomorrow
        });

        // 3. Dynamic Appointments Check
        const upcomingAppointments = await Appointment.find({
            $or: [{ lawyerId: userId }, { clientId: userId }],
            date: { $gte: today, $lt: dayAfter },
            status: 'CONFIRMED'
        });

        // 4. Transform into Notification objects
        const dynamicNotifications = [];

        upcomingCases.forEach(c => {
            const isToday = new Date(c.nextHearingDate) < tomorrow;
            dynamicNotifications.push({
                _id: `temp_case_${c._id}`,
                userId,
                message: `⚖️ Hearing ${isToday ? 'TODAY' : 'Tomorrow'}: ${c.title} (${c.court})`,
                type: 'ALERT',
                isRead: false, // Always show as new
                createdAt: c.nextHearingDate
            });
        });

        upcomingAppointments.forEach(a => {
            const isToday = new Date(a.date) < tomorrow;
            dynamicNotifications.push({
                _id: `temp_apt_${a._id}`,
                userId,
                message: `📅 Appointment ${isToday ? 'TODAY' : 'Tomorrow'} at ${new Date(a.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
                type: 'INFO',
                isRead: false,
                createdAt: a.date
            });
        });

        // Combine and sort
        const allNotifications = [...dynamicNotifications, ...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(allNotifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Ignore temporary IDs (virtual notifications)
        if (id.startsWith('temp_')) {
            return res.json({ message: 'Marked as read locally' });
        }

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
