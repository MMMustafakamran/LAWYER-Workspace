const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/marketplaceController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Public marketplace
router.get('/', getItems);
router.get('/item/:id', getItemById);

// Seller dashboard
router.get('/my-items', getMyItems);
router.get('/seller-stats', getSellerStats);

// Item CRUD
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

// Cart operations
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.patch('/cart/:id', updateCartItem);
router.delete('/cart/:id', removeFromCart);
router.delete('/cart', clearCart);

// Checkout
router.post('/checkout', checkout);

module.exports = router;
