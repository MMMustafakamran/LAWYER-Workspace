const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    message: { type: String, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    barId: String
}, { timestamps: true });

chatSchema.index({ senderId: 1, receiverId: 1 });
chatSchema.index({ barId: 1 });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
