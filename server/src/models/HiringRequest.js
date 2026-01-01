const mongoose = require('mongoose');

// NEW: Hiring request model
const hiringRequestSchema = new mongoose.Schema({
    lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: String,
    caseType: String,
    status: { 
        type: String, 
        enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'],
        default: 'PENDING'
    },
    budget: Number,
    responseMessage: String
}, { timestamps: true });

hiringRequestSchema.index({ lawyerId: 1 });
hiringRequestSchema.index({ clientId: 1 });
hiringRequestSchema.index({ status: 1 });

const HiringRequest = mongoose.model('HiringRequest', hiringRequestSchema);

module.exports = HiringRequest;
