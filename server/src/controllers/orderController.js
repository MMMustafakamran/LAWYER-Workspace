const Order = require('../models/Order');
const MarketplaceItem = require('../models/MarketplaceItem');

const createOrder = async (req, res) => {
    try {
        const { items, total, paymentMethod } = req.body;
        const userId = req.user.id;

        const paymentStatus = paymentMethod === 'CARD' ? 'PAID' : 'PENDING';

        // Create order with embedded items
        const orderItems = items.map(item => ({
            itemId: item._id || item.id, // Support both MongoDB _id and fallback
            quantity: 1,
            price: parseFloat(item.price)
        }));

        const order = await Order.create({
            userId,
            total,
            commission: total * 0.05, // 5% Commission
            status: 'COMPLETED',
            paymentMethod: paymentMethod || 'COD',
            paymentStatus,
            items: orderItems
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
        const orders = await Order.find({ userId })
            .sort({ createdAt: -1 });

        // Populate item details for each order
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const orderObj = order.toObject();
            orderObj.items = await Promise.all(orderObj.items.map(async (orderItem) => {
                const item = await MarketplaceItem.findById(orderItem.itemId);
                return {
                    ...orderItem,
                    item
                };
            }));
            return orderObj;
        }));

        res.json(ordersWithItems);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

module.exports = { createOrder, getMyOrders };
