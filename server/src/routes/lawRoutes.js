const express = require('express');
const router = express.Router();
const { getAllLaws, getLawById, searchLaws, seedLaws } = require('../controllers/lawController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', getAllLaws);
router.get('/search', searchLaws);
router.post('/seed', seedLaws); // Temporary route for seeding
router.get('/:id', getLawById);

module.exports = router;
