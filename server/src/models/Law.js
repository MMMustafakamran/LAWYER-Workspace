const mongoose = require('mongoose');

const lawSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    content: { type: String, required: true }
}, { timestamps: true });

lawSchema.index({ category: 1 });
lawSchema.index({ title: 'text', description: 'text', content: 'text' });

const Law = mongoose.model('Law', lawSchema);

module.exports = Law;
