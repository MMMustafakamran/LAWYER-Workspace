const MarketplaceItem = require('../models/MarketplaceItem');

const getItems = async (req, res) => {
    try {
        const items = await MarketplaceItem.find({ status: 'AVAILABLE' })
            .populate('sellerId', 'name email')
            .sort({ createdAt: -1 });

        // Transform to match expected format
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

const createItem = async (req, res) => {
    try {
        const { name, description, price, imageUrl } = req.body;
        const sellerId = req.user.id;

        const item = await MarketplaceItem.create({
            name,
            description,
            price: parseFloat(price),
            imageUrl,
            status: 'AVAILABLE',
            sellerId
        });

        res.status(201).json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getItems,
    createItem
};
