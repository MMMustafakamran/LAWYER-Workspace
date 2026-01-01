const Case = require('../models/Case');
const Document = require('../models/Document');

const createCase = async (req, res) => {
    try {
        console.log('Create Case Request Body:', req.body);
        console.log('Create Case User:', req.user);

        const { title, caseNumber, court, type, status, nextHearingDate } = req.body;

        let lawyerId = req.user.id;
        let clientId = req.body.clientId || null;

        // If the creator is a Litigant, assign them as the client
        if (req.user.role === 'LITIGANT') {
            clientId = req.user.id;
        }

        const newCase = await Case.create({
            title,
            caseNumber,
            court,
            type,
            status: status || 'OPEN',
            nextHearingDate: nextHearingDate ? new Date(nextHearingDate) : null,
            lawyerId,
            clientId,
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
        const cases = await Case.find({
            $or: [
                { lawyerId: userId },
                { clientId: userId }
            ]
        })
            .populate('clientId', 'name email')
            .populate('lawyerId', 'name email')
            .sort({ createdAt: -1 });

        // Transform to match expected format
        const result = cases.map(c => ({
            ...c.toObject(),
            client: c.clientId,
            lawyer: c.lawyerId
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getCaseById = async (req, res) => {
    try {
        const { id } = req.params;
        const caseItem = await Case.findById(id);

        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        // Get documents for this case
        const documents = await Document.find({ caseId: id });
        
        const result = {
            ...caseItem.toObject(),
            documents
        };

        res.json(result);
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
        const caseItem = await Case.findById(id);

        if (!caseItem) {
            return res.status(404).json({ error: 'Case not found' });
        }

        // Check authorization
        if (caseItem.lawyerId.toString() !== req.user.id && caseItem.clientId?.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to upload documents to this case' });
        }

        const document = await Document.create({
            caseId: id,
            fileUrl: `/uploads/${file.filename}`,
            uploadedBy: req.user.id
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
