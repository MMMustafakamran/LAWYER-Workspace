const prisma = require('../utils/prisma');

const getItems = async (req, res) => {
    try {
        const items = await prisma.marketplaceItem.findMany({
            where: { status: 'AVAILABLE' },
            include: {
                seller: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createItem = async (req, res) => {
    try {
        const { name, description, price, imageUrl } = req.body;
        const sellerId = req.user.id;

        const item = await prisma.marketplaceItem.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                imageUrl,
                status: 'AVAILABLE',
                sellerId
            }
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
