const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

const createAppointment = async (req, res) => {
    try {
        const { lawyerId, date, notes } = req.body;
        const clientId = req.user.id;

        const appointment = await Appointment.create({
            lawyerId,
            clientId,
            date: new Date(date),
            notes,
            status: 'PENDING'
        });

        // Notify Lawyer
        await Notification.create({
            userId: lawyerId,
            message: `New appointment request from ${req.user.name}`,
            type: 'ALERT'
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

        const query = role === 'LAWYER' ? { lawyerId: userId } : { clientId: userId };

        const appointments = await Appointment.find(query)
            .populate('lawyerId', 'name email phone')
            .populate('clientId', 'name email phone')
            .sort({ date: 1 });

        // Transform to match expected format
        const result = appointments.map(apt => ({
            ...apt.toObject(),
            lawyer: apt.lawyerId,
            client: apt.clientId,
            lawyerId: apt.lawyerId._id,
            clientId: apt.clientId._id
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Notify Client
        await Notification.create({
            userId: appointment.clientId,
            message: `Your appointment status is now: ${status}`,
            type: 'INFO'
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
