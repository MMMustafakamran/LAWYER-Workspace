const MarketplaceItem = require('../models/MarketplaceItem');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const getItems = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice } = req.query;
        
        let filter = { status: 'AVAILABLE' };
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (minPrice) filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
        if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };

        const items = await MarketplaceItem.find(filter)
            .populate('sellerId', 'name email')
            .sort({ createdAt: -1 });

        const result = items.map(item => ({
            ...item.toObject(),
            seller: item.sellerId
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await MarketplaceItem.findById(id)
            .populate('sellerId', 'name email phone');

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json({ ...item.toObject(), seller: item.sellerId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createItem = async (req, res) => {
    try {
        const { name, description, price, imageUrl, category } = req.body;
        const sellerId = req.user.id;

        const item = await MarketplaceItem.create({
            name,
            description,
            price: parseFloat(price),
            imageUrl,
            category,
            status: 'AVAILABLE',
            sellerId
        });

        res.status(201).json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, imageUrl, status } = req.body;

        const item = await MarketplaceItem.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (item.sellerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (name) item.name = name;
        if (description) item.description = description;
        if (price) item.price = parseFloat(price);
        if (imageUrl) item.imageUrl = imageUrl;
        if (status) item.status = status;

        await item.save();
        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await MarketplaceItem.findById(id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (item.sellerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await item.deleteOne();
        res.json({ message: 'Item deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Seller Dashboard
const getMyItems = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const items = await MarketplaceItem.find({ sellerId }).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getSellerStats = async (req, res) => {
    try {
        const sellerId = req.user.id;

        const [totalItems, soldItems, orders] = await Promise.all([
            MarketplaceItem.countDocuments({ sellerId }),
            MarketplaceItem.countDocuments({ sellerId, status: 'SOLD' }),
            Order.find({ 'items.itemId': { $in: await MarketplaceItem.find({ sellerId }).distinct('_id') } })
        ]);

        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

        res.json({
            totalItems,
            soldItems,
            activeItems: totalItems - soldItems,
            totalOrders: orders.length,
            totalRevenue
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Cart operations
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItems = await Cart.find({ userId })
            .populate('itemId');

        const items = cartItems.map(ci => ({
            _id: ci._id,
            item: ci.itemId,
            quantity: ci.quantity
        }));

        const total = items.reduce((sum, i) => sum + (i.item?.price || 0) * i.quantity, 0);

        res.json({ items, total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId, quantity = 1 } = req.body;

        // Check if already in cart
        let cartItem = await Cart.findOne({ userId, itemId });
        
        if (cartItem) {
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            cartItem = await Cart.create({ userId, itemId, quantity });
        }

        res.status(201).json(cartItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        const cartItem = await Cart.findById(id);
        if (!cartItem || cartItem.userId.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        if (quantity <= 0) {
            await cartItem.deleteOne();
            return res.json({ message: 'Item removed from cart' });
        }

        cartItem.quantity = quantity;
        await cartItem.save();
        res.json(cartItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;
        await Cart.findByIdAndDelete(id);
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        await Cart.deleteMany({ userId });
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const checkout = async (req, res) => {
    try {
        const userId = req.user.id;
        const { paymentMethod = 'COD' } = req.body;

        const cartItems = await Cart.find({ userId }).populate('itemId');
        
        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const items = cartItems.map(ci => ({
            itemId: ci.itemId._id,
            quantity: ci.quantity,
            price: ci.itemId.price
        }));

        const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

        const order = await Order.create({
            userId,
            items,
            total,
            paymentMethod,
            paymentStatus: paymentMethod === 'CARD' ? 'PAID' : 'PENDING',
            status: 'COMPLETED'
        });

        // Clear cart
        await Cart.deleteMany({ userId });

        res.status(201).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    getMyItems,
    getSellerStats,
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkout
};
