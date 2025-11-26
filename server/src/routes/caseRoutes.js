const express = require('express');
const { createCase, getCases, getCaseById } = require('../controllers/caseController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken); // Protect all routes

router.post('/', createCase);
router.get('/', getCases);
router.get('/:id', getCaseById);

module.exports = router;
