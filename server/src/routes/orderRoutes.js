const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders } = require('../controllers/orderController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createOrder);
router.get('/', authenticateToken, getMyOrders);

module.exports = router;
