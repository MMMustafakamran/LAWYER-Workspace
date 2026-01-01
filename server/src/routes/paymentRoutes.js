const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Mock Process Payment
router.post('/pay', async (req, res) => {
    try {
        const { plan, method } = req.body;
        const userId = req.user.id;

        // MOCK PAYMENT PROCESSING
        // In real app, integrate Stripe/JazzCash here
        const success = true; 

        if (success) {
            // Update User Subscription
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month subscription

            await User.findByIdAndUpdate(userId, {
                subscription: {
                    tier: plan,
                    status: 'ACTIVE',
                    expiryDate: expiryDate
                }
            });

            res.json({ success: true, message: `Successfully upgraded to ${plan}` });
        } else {
            res.status(400).json({ success: false, message: 'Payment failed' });
        }

    } catch (error) {
        console.error('Payment Error', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
