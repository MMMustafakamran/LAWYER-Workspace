const express = require('express');
const router = express.Router();
const { getMessages } = require('../controllers/chatController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/:barId', getMessages);

module.exports = router;
