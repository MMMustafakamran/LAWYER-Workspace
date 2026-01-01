const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    caseNumber: String,
    court: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, required: true },
    nextHearingDate: Date,
    lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

caseSchema.index({ lawyerId: 1 });
caseSchema.index({ clientId: 1 });

const Case = mongoose.model('Case', caseSchema);

module.exports = Case;
