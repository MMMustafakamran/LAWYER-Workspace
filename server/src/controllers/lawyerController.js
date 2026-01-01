const User = require('../models/User');
const Case = require('../models/Case');

const getLawyers = async (req, res) => {
    try {
        const { specialization, location } = req.query;

        let filter = { role: 'LAWYER' };

        if (specialization && specialization !== 'All') {
            filter['lawyerProfile.specialization'] = specialization;
        }
        if (location) {
            filter['lawyerProfile.location'] = { $regex: location, $options: 'i' };
        }

        const lawyers = await User.find(filter)
            .select('_id name email phone lawyerProfile');

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
            .select('_id name email phone lawyerProfile');

        if (!lawyer) {
            return res.status(404).json({ message: 'Lawyer not found' });
        }

        // Get lawyer's cases
        const cases = await Case.find({ lawyerId: id })
            .select('_id title status');

        const result = {
            ...lawyer.toObject(),
            casesAsLawyer: cases
        };

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { specialization, experience, bio, location, hourlyRate } = req.body;

        const profileData = {
            specialization,
            experience: experience ? parseInt(experience) : undefined,
            bio,
            location,
            hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined
        };

        // Remove undefined values
        Object.keys(profileData).forEach(key => 
            profileData[key] === undefined && delete profileData[key]
        );

        const user = await User.findByIdAndUpdate(
            userId,
            { lawyerProfile: profileData },
            { new: true }
        ).select('lawyerProfile');

        res.json(user.lawyerProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getLawyers,
    getLawyerById,
    updateProfile
};
