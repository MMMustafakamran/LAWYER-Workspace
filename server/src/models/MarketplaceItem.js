const mongoose = require('mongoose');

const marketplaceItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    imageUrl: String,
    status: { type: String, required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

marketplaceItemSchema.index({ sellerId: 1 });
marketplaceItemSchema.index({ status: 1 });

const MarketplaceItem = mongoose.model('MarketplaceItem', marketplaceItemSchema);

module.exports = MarketplaceItem;
