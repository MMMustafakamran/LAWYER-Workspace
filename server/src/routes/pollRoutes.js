const express = require('express');
const router = express.Router();
const { createPoll, getPolls, vote } = require('../controllers/pollController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', getPolls);
router.post('/', createPoll);
router.post('/vote', vote);

module.exports = router;
