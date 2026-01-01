import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { ShoppingBag, Plus, Tag, ShoppingCart, X, CreditCard, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Marketplace() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', description: '', price: '' });

    // Cart State
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('COD'); // Default to COD

    const isAdmin = user?.role === 'SYSTEM_ADMIN' || user?.role === 'SUPER_ADMIN';

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/marketplace');
            setItems(res.data);
        } catch (error) {
            console.error('Failed to fetch items', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/marketplace', newItem);
            setNewItem({ name: '', description: '', price: '' });
            setShowForm(false);
            fetchItems();
        } catch (error) {
            console.error('Failed to create item', error);
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await axios.delete(`/marketplace/${itemId}`);
            fetchItems();
        } catch (error) {
            console.error('Failed to delete item', error);
            alert('Failed to delete item');
        }
    };

    // Cart Logic
    const addToCart = (item) => {
        if (!cart.find(i => i._id === item._id)) {
            setCart([...cart, item]);
            setIsCartOpen(true);
        }
    };

    const removeFromCart = (itemId) => {
        setCart(cart.filter(item => item._id !== itemId));
    };

    const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        try {
            await axios.post('/orders', {
                items: cart,
                total: cartTotal,
                paymentMethod
            });
            alert(`Order placed successfully via ${paymentMethod}!`);
            setCart([]);
            setIsCartOpen(false);
        } catch (error) {
            console.error('Checkout failed', error);
            alert('Checkout failed. Please try again.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Header with Cart Button */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-primary-900">Legal Marketplace</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                        <ShoppingCart className="w-6 h-6" />
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {cart.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-primary flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Sell Item
                    </button>
                </div>
            </div>

            {/* Cart Drawer */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsCartOpen(false)}></div>
                    <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
                        <div className="w-screen max-w-md">
                            <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                                        <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 p-6 flex-1">
                                    {cart.length === 0 ? (
                                        <div className="text-center text-gray-500 mt-10">
                                            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>Your cart is empty.</p>
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-gray-200">
                                            {cart.map((item) => (
                                                <li key={item._id} className="py-4 flex">
                                                    <div className="flex-1 ml-4">
                                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                                            <h3>{item.name}</h3>
                                                            <p className="ml-4">${item.price}</p>
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-500">{item.seller?.name || 'Seller'}</p>
                                                        <div className="flex justify-end mt-2">
                                                            <button
                                                                onClick={() => removeFromCart(item._id)}
                                                                className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-1" /> Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {cart.length > 0 && (
                                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                                        <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                                            <p>Subtotal</p>
                                            <p>${cartTotal.toFixed(2)}</p>
                                        </div>

                                        <div className="mb-6">
                                            <p className="text-sm font-medium text-gray-900 mb-2">Payment Method</p>
                                            <div className="space-y-2">
                                                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                        type="radio"
                                                        name="payment"
                                                        value="COD"
                                                        checked={paymentMethod === 'COD'}
                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                                                    />
                                                    <span className="text-sm font-medium text-gray-900">Cash on Delivery (COD)</span>
                                                </label>
                                                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                        type="radio"
                                                        name="payment"
                                                        value="CARD"
                                                        checked={paymentMethod === 'CARD'}
                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                                                    />
                                                    <span className="text-sm font-medium text-gray-900">Credit Card (Mock)</span>
                                                </label>
                                            </div>
                                        </div>

                                        <p className="mt-0.5 text-sm text-gray-500 mb-6">
                                            Shipping and taxes calculated at checkout.
                                        </p>
                                        <button
                                            onClick={handleCheckout}
                                            disabled={isCheckingOut}
                                            className="w-full btn-primary flex justify-center items-center py-3 text-lg"
                                        >
                                            {isCheckingOut ? 'Processing...' : (
                                                <>
                                                    <CreditCard className="w-5 h-5 mr-2" />
                                                    {paymentMethod === 'COD' ? 'Place Order (COD)' : 'Pay Now'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showForm && (
                <div className="card p-5">
                    <h3 className="text-lg font-semibold text-primary-900 mb-4">List New Item</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Item Name</label>
                            <input
                                type="text"
                                required
                                className="input-field mt-1"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                required
                                className="input-field mt-1"
                                rows="3"
                                value={newItem.description}
                                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                className="input-field mt-1"
                                value={newItem.price}
                                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                                List Item
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <p className="col-span-full text-center py-8 text-gray-500">Loading marketplace...</p>
                ) : items.length > 0 ? (
                    items.map((item) => (
                        <div key={item._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                            <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform hover:scale-105" />
                                ) : (
                                    <ShoppingBag className="h-12 w-12 text-gray-300" />
                                )}
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                                        ${item.price}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mb-4 flex-grow">{item.description}</p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                    <span className="text-xs text-gray-400 flex items-center">
                                        <Tag className="w-3 h-3 mr-1" />
                                        {item.seller?.name || 'Unknown Seller'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDeleteItem(item._id)}
                                                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                title="Delete Item"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => addToCart(item)}
                                            disabled={cart.some(cartItem => cartItem._id === item._id)}
                                            className={`text-sm font-medium ${cart.some(cartItem => cartItem._id === item._id) ? 'text-green-600 cursor-default' : 'text-accent-600 hover:text-accent-700'}`}
                                        >
                                            {cart.some(cartItem => cartItem._id === item._id) ? 'Added' : 'Add to Cart'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
                        <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Marketplace is empty</h3>
                        <p className="mt-1 text-sm text-gray-500">Be the first to list an item!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
