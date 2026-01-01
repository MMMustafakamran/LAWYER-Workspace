const User = require('../models/User');
const Case = require('../models/Case');
const Law = require('../models/Law');
const Poll = require('../models/Poll');

const getStats = async (req, res) => {
    try {
        const [userCount, lawyerCount, caseCount, lawCount, pollCount] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'LAWYER' }),
            Case.countDocuments(),
            Law.countDocuments(),
            Poll.countDocuments()
        ]);

        res.json({
            users: userCount,
            lawyers: lawyerCount,
            cases: caseCount,
            laws: lawCount,
            polls: pollCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .sort({ createdAt: -1 })
            .select('_id name email role createdAt lawyerProfile.specialization lawyerProfile.location');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getStats,
    getUsers,
    updateUserStatus
};
