const mongoose = require('mongoose');

const caseNoteSchema = new mongoose.Schema({
    content: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const caseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    caseNumber: String,
    court: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, required: true, default: 'OPEN' },
    nextHearingDate: Date,
    lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // NEW: Notes section
    notes: [caseNoteSchema],
    // NEW: Case sharing
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // NEW: Status history tracking
    statusHistory: [{
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
}, { timestamps: true });

// Indexes for search
caseSchema.index({ lawyerId: 1 });
caseSchema.index({ clientId: 1 });
caseSchema.index({ title: 'text', caseNumber: 'text', court: 'text' });
caseSchema.index({ status: 1 });

const Case = mongoose.model('Case', caseSchema);

module.exports = Case;
