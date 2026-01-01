const User = require('../models/User');
const Case = require('../models/Case');
const HiringRequest = require('../models/HiringRequest');
const Notification = require('../models/Notification');

const getLawyers = async (req, res) => {
    try {
        const { specialization, location, availableOnly } = req.query;

        let filter = { role: 'LAWYER' };

        if (specialization && specialization !== 'All') {
            filter['lawyerProfile.specialization'] = specialization;
        }
        if (location) {
            filter['lawyerProfile.location'] = { $regex: location, $options: 'i' };
        }
        if (availableOnly === 'true') {
            filter['lawyerProfile.isAvailableForHiring'] = true;
        }

        const lawyers = await User.find(filter)
            .select('_id name email phone lawyerProfile profilePicture');

        res.json(lawyers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getLawyerById = async (req, res) => {
    try {
        const { id } = req.params;
        const lawyer = await User.findOne({ _id: id, role: 'LAWYER' })
            .select('_id name email phone lawyerProfile profilePicture');

        if (!lawyer) {
            return res.status(404).json({ message: 'Lawyer not found' });
        }

        const cases = await Case.find({ lawyerId: id })
            .select('_id title status');

        res.json({
            ...lawyer.toObject(),
            casesAsLawyer: cases
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { specialization, experience, bio, location, hourlyRate, isAvailableForHiring, availability } = req.body;

        const user = await User.findById(userId);
        if (!user.lawyerProfile) {
            user.lawyerProfile = {};
        }

        if (specialization !== undefined) user.lawyerProfile.specialization = specialization;
        if (experience !== undefined) user.lawyerProfile.experience = parseInt(experience);
        if (bio !== undefined) user.lawyerProfile.bio = bio;
        if (location !== undefined) user.lawyerProfile.location = location;
        if (hourlyRate !== undefined) user.lawyerProfile.hourlyRate = parseFloat(hourlyRate);
        if (isAvailableForHiring !== undefined) user.lawyerProfile.isAvailableForHiring = isAvailableForHiring;
        if (availability !== undefined) user.lawyerProfile.availability = availability;

        await user.save();
        res.json(user.lawyerProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// NEW: Toggle hiring availability
const toggleHiring = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user.lawyerProfile) {
            return res.status(400).json({ message: 'Lawyer profile not found' });
        }

        user.lawyerProfile.isAvailableForHiring = !user.lawyerProfile.isAvailableForHiring;
        await user.save();

        res.json({ isAvailableForHiring: user.lawyerProfile.isAvailableForHiring });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// NEW: Hire a lawyer (create hiring request)
const hireLawyer = async (req, res) => {
    try {
        const { lawyerId, message, caseType, budget } = req.body;
        const clientId = req.user.id;

        const lawyer = await User.findById(lawyerId);
        if (!lawyer || lawyer.role !== 'LAWYER') {
            return res.status(404).json({ message: 'Lawyer not found' });
        }

        if (!lawyer.lawyerProfile?.isAvailableForHiring) {
            return res.status(400).json({ message: 'Lawyer is not available for hiring' });
        }

        const hiringRequest = await HiringRequest.create({
            lawyerId,
            clientId,
            message,
            caseType,
            budget
        });

        // Notify lawyer
        await Notification.create({
            userId: lawyerId,
            message: `New hiring request from a client`,
            type: 'ALERT'
        });

        res.status(201).json(hiringRequest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// NEW: Get hiring requests (for lawyers and clients)
const getHiringRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        let filter = {
            $or: [{ lawyerId: userId }, { clientId: userId }]
        };
        if (status) filter.status = status;

        const requests = await HiringRequest.find(filter)
            .populate('lawyerId', 'name email phone lawyerProfile')
            .populate('clientId', 'name email phone')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// NEW: Respond to hiring request
const respondToHiringRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, responseMessage } = req.body;

        const request = await HiringRequest.findById(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.lawyerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        request.status = status;
        request.responseMessage = responseMessage;
        await request.save();

        // Notify client
        await Notification.create({
            userId: request.clientId,
            message: `Your hiring request has been ${status.toLowerCase()}`,
            type: 'INFO'
        });

        res.json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getLawyers,
    getLawyerById,
    updateProfile,
    toggleHiring,
    hireLawyer,
    getHiringRequests,
    respondToHiringRequest
};
