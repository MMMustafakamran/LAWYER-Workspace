const express = require('express');
const router = express.Router();
const { createPoll, getPolls, vote, deletePoll } = require('../controllers/pollController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', getPolls);
router.post('/', createPoll);
router.post('/vote', vote);
router.delete('/:id', deletePoll);

module.exports = router;
