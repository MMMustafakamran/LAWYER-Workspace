const prisma = require('../utils/prisma');

const createOrder = async (req, res) => {
    try {
        const { items, total, paymentMethod } = req.body;
        const userId = req.user.id;

        const paymentStatus = paymentMethod === 'CARD' ? 'PAID' : 'PENDING';

        const order = await prisma.order.create({
            data: {
                userId,
                total,
                status: 'COMPLETED',
                paymentMethod: paymentMethod || 'COD',
                paymentStatus,
                items: {
                    create: items.map(item => ({
                        itemId: item.id,
                        quantity: 1,
                        price: item.price
                    }))
                }
            },
            include: {
                items: true
            }
        });

        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        item: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

module.exports = { createOrder, getMyOrders };
