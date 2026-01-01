const express = require('express');
const router = express.Router();
const { 
    getProfile, 
    updateProfile, 
    changePassword, 
    updateLanguage,
    deleteAccount 
} = require('../controllers/profileController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/password', changePassword);
router.put('/language', updateLanguage);
router.delete('/', deleteAccount);

module.exports = router;
