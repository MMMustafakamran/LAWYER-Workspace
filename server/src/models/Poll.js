const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    question: { type: String, required: true },
    barType: { type: String, required: true },
    candidateList: [String],
    endDate: { type: Date, required: true }
}, { timestamps: true });

pollSchema.index({ barType: 1 });

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;
