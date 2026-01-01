const express = require('express');
const router = express.Router();
const { 
    createCase, 
    getCases, 
    searchCases,
    getCaseById, 
    updateCaseStatus,
    addNote,
    shareCase,
    uploadDocument 
} = require('../controllers/caseController');
const authenticateToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authenticateToken);

router.post('/', createCase);
router.get('/', getCases);
router.get('/search', searchCases);
router.get('/:id', getCaseById);
router.patch('/:id/status', updateCaseStatus);
router.post('/:id/notes', addNote);
router.post('/:id/share', shareCase);
router.post('/:id/documents', upload.single('file'), uploadDocument);

module.exports = router;
