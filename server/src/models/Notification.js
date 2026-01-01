const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    type: { type: String, enum: ['INFO', 'MESSAGE', 'ALERT'], default: 'INFO' }
}, { timestamps: true });

notificationSchema.index({ userId: 1 });
notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
