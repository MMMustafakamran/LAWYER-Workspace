const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    pollId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    choice: { type: String, required: true }
}, { timestamps: true });

// Ensure one vote per user per poll
voteSchema.index({ pollId: 1, userId: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
