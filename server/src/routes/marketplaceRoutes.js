const express = require('express');
const router = express.Router();
const { getItems, createItem } = require('../controllers/marketplaceController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', getItems);
router.post('/', createItem);

module.exports = router;
