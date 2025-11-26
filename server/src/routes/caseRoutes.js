const express = require('express');
const router = express.Router();
const { createCase, getCases, getCaseById, uploadDocument } = require('../controllers/caseController');
const authenticateToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authenticateToken);

router.post('/', createCase);
router.get('/', getCases);
router.get('/:id', getCaseById);
router.post('/:id/documents', upload.single('file'), uploadDocument);

module.exports = router;
