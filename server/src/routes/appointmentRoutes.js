const express = require('express');
const router = express.Router();
const { createAppointment, getMyAppointments, updateStatus } = require('../controllers/appointmentController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/', createAppointment);
router.get('/', getMyAppointments);
router.put('/:id/status', updateStatus);

module.exports = router;
