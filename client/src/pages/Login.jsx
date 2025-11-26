import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-primary-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl border-t-4 border-primary-900">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-primary-900 font-serif">Lawyer Workspace</h2>
                    <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
                </div>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field mt-1"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field mt-1"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full btn-primary justify-center"
                    >
                        Login
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600">
                    Don't have an account? <Link to="/register" className="text-primary-700 hover:text-primary-900 font-medium hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
}
