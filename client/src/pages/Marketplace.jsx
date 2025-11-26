import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { ShoppingBag, Plus, Tag } from 'lucide-react';

export default function Marketplace() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', description: '', price: '' });

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-primary-900">Legal Marketplace</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Sell Item
                </button>
            </div>

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
                        <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                            <div className="h-48 bg-gray-100 flex items-center justify-center">
                                <ShoppingBag className="h-12 w-12 text-gray-300" />
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
                                    <button className="text-sm font-medium text-accent-600 hover:text-accent-700">
                                        Buy Now
                                    </button>
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
