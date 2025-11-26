const express = require('express');
const router = express.Router();
const { getStats, getUsers, updateUserStatus } = require('../controllers/adminController');
const authenticateToken = require('../middleware/authMiddleware');

// Middleware to check for admin role
const requireAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'SYSTEM_ADMIN' || req.user.role === 'SUPER_ADMIN')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUserStatus);

module.exports = router;
