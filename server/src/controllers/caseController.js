const Case = require('../models/Case');
const Document = require('../models/Document');
const User = require('../models/User');

const createCase = async (req, res) => {
    try {
        const { title, caseNumber, court, type, status, nextHearingDate } = req.body;

        let lawyerId = req.user.id;
        let clientId = req.body.clientId || null;

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
            statusHistory: [{ status: status || 'OPEN', changedBy: req.user.id }]
        });

        res.status(201).json(newCase);
    } catch (error) {
        console.error('Create Case Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getCases = async (req, res) => {
    try {
        const userId = req.user.id;

        const cases = await Case.find({
            $or: [
                { lawyerId: userId },
                { clientId: userId },
                { sharedWith: userId }
            ]
        })
            .populate('clientId', 'name email')
            .populate('lawyerId', 'name email')
            .sort({ createdAt: -1 });

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

// NEW: Search cases
const searchCases = async (req, res) => {
    try {
        const userId = req.user.id;
        const { query, status, court, type } = req.query;

        let filter = {
            $or: [
                { lawyerId: userId },
                { clientId: userId },
                { sharedWith: userId }
            ]
        };

        if (query) {
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { caseNumber: { $regex: query, $options: 'i' } },
                    { court: { $regex: query, $options: 'i' } }
                ]
            });
        }

        if (status) filter.status = status;
        if (court) filter.court = { $regex: court, $options: 'i' };
        if (type) filter.type = type;

        const cases = await Case.find(filter)
            .populate('clientId', 'name email')
            .populate('lawyerId', 'name email')
            .sort({ createdAt: -1 });

        res.json(cases);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getCaseById = async (req, res) => {
    try {
        const { id } = req.params;
        const caseItem = await Case.findById(id)
            .populate('lawyerId', 'name email phone')
            .populate('clientId', 'name email phone')
            .populate('sharedWith', 'name email')
            .populate('notes.createdBy', 'name');

        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        const documents = await Document.find({ caseId: id });
        
        res.json({
            ...caseItem.toObject(),
            documents,
            lawyer: caseItem.lawyerId,
            client: caseItem.clientId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// NEW: Update case status
const updateCaseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const caseItem = await Case.findById(id);
        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        caseItem.status = status;
        caseItem.statusHistory.push({
            status,
            changedBy: req.user.id
        });
        await caseItem.save();

        res.json(caseItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// NEW: Add note to case
const addNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const caseItem = await Case.findById(id);
        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        caseItem.notes.push({
            content,
            createdBy: req.user.id
        });
        await caseItem.save();

        res.status(201).json(caseItem.notes[caseItem.notes.length - 1]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// NEW: Share case with user
const shareCase = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        const caseItem = await Case.findById(id);
        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        // Find user by email
        const userToShare = await User.findOne({ email });
        if (!userToShare) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already shared
        if (caseItem.sharedWith.includes(userToShare._id)) {
            return res.status(400).json({ message: 'Case already shared with this user' });
        }

        caseItem.sharedWith.push(userToShare._id);
        await caseItem.save();

        res.json({ message: 'Case shared successfully', sharedWith: userToShare.name });
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

        if (caseItem.lawyerId.toString() !== req.user.id && caseItem.clientId?.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
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
    searchCases,
    getCaseById,
    updateCaseStatus,
    addNote,
    shareCase,
    uploadDocument
};
