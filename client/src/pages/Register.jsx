import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, ArrowRight, UserPlus } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('LITIGANT');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await register(name, email, password, role);
            navigate('/dashboard');
        } catch (err) {
            console.error('Registration Error:', err);
            const errorMessage = err.response?.data?.message
                || err.message
                || 'Registration failed. Please check your connection.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-accent-400 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-600 rounded-full blur-3xl"></div>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-accent-400 rounded flex items-center justify-center">
                            <Scale className="w-7 h-7 text-primary-900" />
                        </div>
                        <span className="text-2xl font-bold text-white font-serif">Lawyer App</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white font-serif leading-tight mb-4">
                        Join the Legal Ecosystem
                    </h1>
                    <p className="text-primary-200 text-lg mb-8">
                        Whether you're a lawyer, client, or legal professional, connect and collaborate seamlessly.
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-accent-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-primary-900 text-sm font-bold">✓</span>
                            </div>
                            <p className="text-primary-200">Comprehensive case management</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-accent-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-primary-900 text-sm font-bold">✓</span>
                            </div>
                            <p className="text-primary-200">Access to legal research library</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-accent-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-primary-900 text-sm font-bold">✓</span>
                            </div>
                            <p className="text-primary-200">Connect with verified legal professionals</p>
                        </div>
                    </div>
                </div>
                <div className="relative z-10 text-primary-300 text-sm">
                    © {new Date().getFullYear()} Lawyer App. All rights reserved.
                </div>
            </div>

            {/* Right Panel - Register Form */}
            <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-accent-400 rounded flex items-center justify-center">
                            <Scale className="w-6 h-6 text-primary-900" />
                        </div>
                        <span className="text-xl font-bold text-primary-900 font-serif">Lawyer App</span>
                    </div>

                    <div className="card p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-primary-900 mb-2">Create Account</h2>
                            <p className="text-slate-600">Get started with your legal workspace</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="label">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-field"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">I am a</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="LITIGANT">Litigant (Client)</option>
                                    <option value="LAWYER">Lawyer</option>
                                    <option value="CLERK">Clerk</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary justify-center group"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-600">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary-700 hover:text-primary-900 font-medium hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
