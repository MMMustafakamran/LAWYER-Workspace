import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, ArrowRight } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
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
                        Your Complete Legal Workspace
                    </h1>
                    <p className="text-primary-200 text-lg">
                        Manage cases, research laws, connect with clients, and streamline your practice—all in one platform.
                    </p>
                </div>
                <div className="relative z-10 text-primary-300 text-sm">
                    © {new Date().getFullYear()} Lawyer App. All rights reserved.
                </div>
            </div>

            {/* Right Panel - Login Form */}
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
                            <h2 className="text-2xl font-bold text-primary-900 mb-2">Welcome Back</h2>
                            <p className="text-slate-600">Sign in to access your workspace</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
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
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary justify-center group"
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-600">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-primary-700 hover:text-primary-900 font-medium hover:underline">
                                    Create one
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
