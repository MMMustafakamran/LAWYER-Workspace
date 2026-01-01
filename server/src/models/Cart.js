const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketplaceItem', required: true },
    quantity: { type: Number, default: 1 }
}, { timestamps: true });

cartItemSchema.index({ userId: 1 });

const Cart = mongoose.model('Cart', cartItemSchema);

module.exports = Cart;
