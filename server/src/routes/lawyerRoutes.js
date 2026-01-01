const express = require('express');
const router = express.Router();
const { 
    getLawyers, 
    getLawyerById, 
    updateProfile,
    toggleHiring,
    hireLawyer,
    getHiringRequests,
    respondToHiringRequest
} = require('../controllers/lawyerController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', getLawyers);
router.get('/hiring-requests', getHiringRequests);
router.get('/:id', getLawyerById);
router.put('/profile', updateProfile);
router.post('/toggle-hiring', toggleHiring);
router.post('/hire', hireLawyer);
router.patch('/hiring-requests/:id', respondToHiringRequest);

module.exports = router;
