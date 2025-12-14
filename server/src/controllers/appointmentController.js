const prisma = require('../utils/prisma');

const createAppointment = async (req, res) => {
    try {
        const { lawyerId, date, notes } = req.body;
        const clientId = req.user.id;

        const appointment = await prisma.appointment.create({
            data: {
                lawyerId: parseInt(lawyerId),
                clientId,
                date: new Date(date),
                notes,
                status: 'PENDING'
            }
        });

        // Notify Lawyer
        await prisma.notification.create({
            data: {
                userId: parseInt(lawyerId),
                message: `New appointment request from ${req.user.name}`,
                type: 'ALERT'
            }
        });

        res.status(201).json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMyAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        const where = role === 'LAWYER' ? { lawyerId: userId } : { clientId: userId };

        const appointments = await prisma.appointment.findMany({
            where,
            include: {
                lawyer: { select: { name: true, email: true } },
                client: { select: { name: true, email: true } }
            },
            orderBy: { date: 'asc' }
        });

        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const appointment = await prisma.appointment.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        // Notify Client
        await prisma.notification.create({
            data: {
                userId: appointment.clientId,
                message: `Your appointment status is now: ${status}`,
                type: 'INFO'
            }
        });

        res.json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    createAppointment,
    getMyAppointments,
    updateStatus
};
