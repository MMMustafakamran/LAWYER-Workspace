const prisma = require('../utils/prisma');

const getLawyers = async (req, res) => {
    try {
        const { specialization, location } = req.query;

        const where = {
            role: 'LAWYER'
        };

        if (specialization || location) {
            where.lawyerProfile = {};
            if (specialization && specialization !== 'All') {
                where.lawyerProfile.specialization = specialization;
            }
            if (location) {
                where.lawyerProfile.location = { contains: location, mode: 'insensitive' };
            }
        }

        const lawyers = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                lawyerProfile: true
            }
        });

        res.json(lawyers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getLawyerById = async (req, res) => {
    try {
        const { id } = req.params;
        const lawyer = await prisma.user.findUnique({
            where: {
                id: parseInt(id),
                role: 'LAWYER'
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                lawyerProfile: true,
                casesAsLawyer: {
                    select: {
                        id: true,
                        title: true,
                        status: true
                    }
                }
            }
        });

        if (!lawyer) {
            return res.status(404).json({ message: 'Lawyer not found' });
        }
        res.json(lawyer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { specialization, experience, bio, location, hourlyRate } = req.body;

        const profile = await prisma.lawyerProfile.upsert({
            where: { userId },
            update: {
                specialization,
                experience: experience ? parseInt(experience) : undefined,
                bio,
                location,
                hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined
            },
            create: {
                userId,
                specialization,
                experience: experience ? parseInt(experience) : undefined,
                bio,
                location,
                hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined
            }
        });

        res.json(profile);
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
