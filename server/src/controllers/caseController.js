const prisma = require('../utils/prisma');

const createCase = async (req, res) => {
    try {
        console.log('Create Case Request Body:', req.body);
        console.log('Create Case User:', req.user);

        const { title, caseNumber, court, type, status, nextHearingDate } = req.body;

        let lawyerId = req.user.id;
        let clientId = req.body.clientId ? parseInt(req.body.clientId) : null;

        // If the creator is a Litigant, assign them as the client
        if (req.user.role === 'LITIGANT') {
            clientId = req.user.id;
            // For now, we keep lawyerId as the creator (even if litigant) to satisfy the DB constraint
            // until we have a "Select Lawyer" feature.
        }

        const newCase = await prisma.case.create({
            data: {
                title,
                caseNumber,
                court,
                type,
                status: status || 'OPEN',
                nextHearingDate: nextHearingDate ? new Date(nextHearingDate) : null,
                lawyerId,
                clientId,
            },
        });

        console.log('Case Created:', newCase);
        res.status(201).json(newCase);
    } catch (error) {
        console.error('Create Case Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getCases = async (req, res) => {
    try {
        const userId = req.user.id;

        // Show cases where the user is either the lawyer OR the client
        const cases = await prisma.case.findMany({
            where: {
                OR: [
                    { lawyerId: userId },
                    { clientId: userId }
                ]
            },
            include: {
                client: { select: { name: true, email: true } },
                lawyer: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

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
};

const uploadDocument = async (req, res) => {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const caseItem = await prisma.case.findUnique({
            where: { id: parseInt(id) }
        });

        if (!caseItem) {
            return res.status(404).json({ error: 'Case not found' });
        }

        // Check authorization
        if (caseItem.lawyerId !== req.user.id && caseItem.clientId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to upload documents to this case' });
        }

        const document = await prisma.document.create({
            data: {
                caseId: parseInt(id),
                fileUrl: `/uploads/${file.filename}`,
                uploadedBy: req.user.id
            }
        });

        res.status(201).json(document);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload document' });
    }
};

module.exports = {
    createCase,
    getCases,
    getCaseById,
    uploadDocument
};
