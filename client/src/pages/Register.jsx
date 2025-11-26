import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('LITIGANT');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password, role);
            navigate('/dashboard');
        } catch (err) {
            console.error('Registration Error:', err);
            const errorMessage = err.response?.data?.message
                || err.message
                || 'Registration failed. Please check your connection.';
            setError(errorMessage);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-primary-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl border-t-4 border-primary-900">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-primary-900 font-serif">Create Account</h2>
                    <p className="mt-2 text-sm text-gray-600">Join the legal ecosystem</p>
                </div>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field mt-1"
                            required
                        />
                    </div>
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="input-field mt-1"
                        >
                            <option value="LITIGANT">Litigant (Client)</option>
                            <option value="LAWYER">Lawyer</option>
                            <option value="CLERK">Clerk</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full btn-primary justify-center"
                    >
                        Register
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="text-primary-700 hover:text-primary-900 font-medium hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}
