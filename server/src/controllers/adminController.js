const prisma = require('../utils/prisma');

const getStats = async (req, res) => {
    try {
        const [userCount, lawyerCount, caseCount, lawCount, pollCount] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'LAWYER' } }),
            prisma.case.count(),
            prisma.law.count(),
            prisma.poll.count()
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
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                lawyerProfile: {
                    select: {
                        specialization: true,
                        location: true
                    }
                }
            }
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body; // For now, just allowing role updates (e.g. verify lawyer)

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { role }
        });

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
