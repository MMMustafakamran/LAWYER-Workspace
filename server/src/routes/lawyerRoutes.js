const express = require('express');
const router = express.Router();
const { getLawyers, getLawyerById, updateProfile } = require('../controllers/lawyerController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', getLawyers);
router.get('/:id', getLawyerById);
router.put('/profile', updateProfile);

module.exports = router;
