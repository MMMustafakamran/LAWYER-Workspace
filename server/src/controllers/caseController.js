const prisma = require('../utils/prisma');

const createCase = async (req, res) => {
    try {
        const { title, caseNumber, court, type, status, nextHearingDate, clientId } = req.body;
        const lawyerId = req.user.id; // From auth middleware

        const newCase = await prisma.case.create({
            data: {
                title,
                caseNumber,
                court,
                type,
                status: status || 'OPEN',
                nextHearingDate: nextHearingDate ? new Date(nextHearingDate) : null,
                lawyerId,
                clientId: clientId ? parseInt(clientId) : null,
            },
        });

        res.status(201).json(newCase);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getCases = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let cases;
        if (role === 'LAWYER') {
            cases = await prisma.case.findMany({
                where: { lawyerId: userId },
                include: { client: { select: { name: true, email: true } } },
            });
        } else if (role === 'LITIGANT') {
            cases = await prisma.case.findMany({
                where: { clientId: userId },
                include: { lawyer: { select: { name: true, email: true } } },
            });
        } else {
            // For other roles or admin, maybe return all or none
            cases = [];
        }

        res.json(cases);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getCaseById = async (req, res) => {
    try {
        const { id } = req.params;
        const caseItem = await prisma.case.findUnique({
            where: { id: parseInt(id) },
            include: { documents: true }
        });

        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }
        res.json(caseItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { createCase, getCases, getCaseById };
