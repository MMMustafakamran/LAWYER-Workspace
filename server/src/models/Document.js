const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' }
}, { timestamps: true });

documentSchema.index({ caseId: 1 });
documentSchema.index({ uploadedBy: 1 });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
