const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['PENDING', 'CONFIRMED', 'CANCELLED'], default: 'PENDING' },
    notes: String
}, { timestamps: true });

appointmentSchema.index({ lawyerId: 1 });
appointmentSchema.index({ clientId: 1 });
appointmentSchema.index({ date: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
