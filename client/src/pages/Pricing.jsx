import { useState } from 'react';
import { Check, Star, Shield, Zap, CreditCard } from 'lucide-react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const plans = [
    {
        name: 'FREE',
        price: '0',
        features: ['Basic Case Management', 'Limited Storage (100MB)', 'Community Support', 'Ad-supported'],
        color: 'bg-gray-100',
        btnColor: 'bg-gray-800'
    },
    {
        name: 'GOLD',
        price: '2000',
        period: '/month',
        features: ['Unlimited Cases', 'No Ads', 'Priority Support', 'Access to Bare Acts'],
        color: 'bg-yellow-50',
        border: 'border-yellow-200',
        btnColor: 'bg-yellow-600',
        popular: true
    },
    {
        name: 'PREMIUM',
        price: '5000',
        period: '/month',
        features: ['AI Legal Assistant', 'Document Automation', 'Advanced Research', 'Cloud Storage (10GB)'],
        color: 'bg-purple-50',
        border: 'border-purple-200',
        btnColor: 'bg-purple-600'
    },
    {
        name: 'PLATINUM',
        price: '10000',
        period: '/month',
        features: ['Firm Management', 'Multiple User Access', 'Dedicated Account Manager', 'API Access'],
        color: 'bg-slate-900 text-white',
        border: 'border-slate-800',
        btnColor: 'bg-white text-slate-900 hover:bg-gray-100'
    }
];

export default function Pricing() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSelectPlan = (plan) => {
        if (plan.name === 'FREE') return;
        setSelectedPlan(plan);
        setShowPaymentModal(true);
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            await axios.post('/payments/pay', {
                plan: selectedPlan.name,
                method: 'MOCK_CARD'
            });
            alert(`Successfully subscribed to ${selectedPlan.name}!`);
            setShowPaymentModal(false);
            window.location.reload(); // Reload to update user context
        } catch (error) {
            console.error('Payment failed', error);
            alert('Payment failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Simple, Transparent Pricing
                </h2>
                <p className="mt-4 text-xl text-gray-500">
                    Choose the plan that fits your legal practice
                </p>
                {user?.subscription && (
                    <div className="mt-4 inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
                        Current Plan: {user.subscription.tier} ({user.subscription.status})
                    </div>
                )}
            </div>

            <div className="grid gap-8 lg:grid-cols-4 sm:grid-cols-2 max-w-7xl mx-auto">
                {plans.map((plan) => (
                    <div 
                        key={plan.name} 
                        className={`relative rounded-2xl p-8 shadow-lg flex flex-col ${plan.color} ${plan.border ? `border ${plan.border}` : ''} transform transition hover:-translate-y-1`}
                    >
                        {plan.popular && (
                            <div className="absolute top-0 right-0 -mt-4 mr-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md">
                                Most Popular
                            </div>
                        )}
                        <h3 className={`text-xl font-bold ${plan.name === 'PLATINUM' ? 'text-white' : 'text-gray-900'}`}>
                            {plan.name}
                        </h3>
                        <div className="mt-4 flex items-baseline">
                            <span className={`text-4xl font-extrabold ${plan.name === 'PLATINUM' ? 'text-white' : 'text-gray-900'}`}>
                                Rs. {plan.price}
                            </span>
                            {plan.period && (
                                <span className={`ml-1 text-xl ${plan.name === 'PLATINUM' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {plan.period}
                                </span>
                            )}
                        </div>
                        <ul className="mt-6 space-y-4 flex-1">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start">
                                    <Check className={`flex-shrink-0 h-5 w-5 ${plan.name === 'PLATINUM' ? 'text-white' : 'text-green-500'}`} />
                                    <span className={`ml-3 text-sm ${plan.name === 'PLATINUM' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handleSelectPlan(plan)}
                            disabled={user?.subscription?.tier === plan.name}
                            className={`mt-8 w-full block rounded-lg py-3 px-6 text-center font-bold shadow hover:shadow-lg transition-all ${plan.btnColor} ${plan.name === 'PLATINUM' ? '' : 'text-white'}`}
                        >
                            {user?.subscription?.tier === plan.name ? 'Current Plan' : 'Subscribe Now'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Mock Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPaymentModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <CreditCard className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            Confirm Subscription
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                You are upgrading to <strong>{selectedPlan?.name}</strong> for <strong>Rs. {selectedPlan?.price}</strong>.
                                            </p>
                                            <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                                                <h4 className="font-bold text-xs uppercase text-gray-400 mb-2">Simulated Payment Gateway</h4>
                                                <label className="flex items-center space-x-3 p-3 bg-white border rounded cursor-pointer hover:border-blue-500">
                                                    <input type="radio" name="payment" defaultChecked className="h-4 w-4 text-blue-600" />
                                                    <span className="font-medium">JazzCash Wallet</span>
                                                </label>
                                                <label className="flex items-center space-x-3 p-3 bg-white border rounded mt-2 cursor-pointer hover:border-blue-500">
                                                    <input type="radio" name="payment" className="h-4 w-4 text-blue-600" />
                                                    <span className="font-medium">EasyPaisa Mobile Account</span>
                                                </label>
                                                <label className="flex items-center space-x-3 p-3 bg-white border rounded mt-2 cursor-pointer hover:border-blue-500">
                                                    <input type="radio" name="payment" className="h-4 w-4 text-blue-600" />
                                                    <span className="font-medium">Visa / Mastercard</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={handlePayment}
                                    disabled={loading}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Pay & Subscribe'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
