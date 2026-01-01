import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Briefcase, BookOpen, Users, Plus, Calendar } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();

    const quickActions = [
        { name: 'New Case', icon: Plus, href: '/cases/new', color: 'bg-primary-900' },
        { name: 'Research', icon: BookOpen, href: '/research', color: 'bg-primary-700' },
        { name: 'Lawyers', icon: Users, href: '/lawyers', color: 'bg-primary-600' },
        { name: 'Appointments', icon: Calendar, href: '/appointments', color: 'bg-accent-500' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary-900">Welcome back, {user?.name}!</h1>
                    <p className="text-slate-600 text-sm capitalize">Your {user?.role?.replace('_', ' ').toLowerCase() || 'User'} Dashboard</p>
                </div>
                <Link to="/cases/new" className="btn-accent">
                    <Plus className="w-4 h-4 mr-2" />
                    New Case
                </Link>
            </div>

            {/* Quick Actions */}
            <div className="card p-5">
                <h2 className="text-lg font-semibold text-primary-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {quickActions.map((action) => (
                        <Link
                            key={action.name}
                            to={action.href}
                            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                        >
                            <div className={`${action.color} p-3 rounded-lg mb-2 group-hover:scale-110 transition-transform`}>
                                <action.icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{action.name}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Role-based info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user?.role === 'LAWYER' && (
                    <div className="card p-5">
                        <h2 className="text-lg font-semibold text-primary-900 mb-4">
                            <Briefcase className="w-5 h-5 inline mr-2" />
                            Your Practice
                        </h2>
                        <div className="space-y-3">
                            <Link to="/cases" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="font-medium">View My Cases</span>
                                <p className="text-sm text-gray-500">Manage your active cases</p>
                            </Link>
                            <Link to="/appointments" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="font-medium">Appointments</span>
                                <p className="text-sm text-gray-500">View scheduled meetings</p>
                            </Link>
                            <Link to="/profile" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="font-medium">Edit Profile</span>
                                <p className="text-sm text-gray-500">Update your profile details</p>
                            </Link>
                        </div>
                    </div>
                )}

                {user?.role === 'LITIGANT' && (
                    <div className="card p-5">
                        <h2 className="text-lg font-semibold text-primary-900 mb-4">
                            <Users className="w-5 h-5 inline mr-2" />
                            Find Legal Help
                        </h2>
                        <div className="space-y-3">
                            <Link to="/lawyers" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="font-medium">Browse Lawyers</span>
                                <p className="text-sm text-gray-500">Find a lawyer for your case</p>
                            </Link>
                            <Link to="/cases" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="font-medium">My Cases</span>
                                <p className="text-sm text-gray-500">View your active cases</p>
                            </Link>
                        </div>
                    </div>
                )}

                <div className="card p-5">
                    <h2 className="text-lg font-semibold text-primary-900 mb-4">
                        <BookOpen className="w-5 h-5 inline mr-2" />
                        Resources
                    </h2>
                    <div className="space-y-3">
                        <Link to="/research" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <span className="font-medium">Legal Research</span>
                            <p className="text-sm text-gray-500">Search laws and regulations</p>
                        </Link>
                        <Link to="/marketplace" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <span className="font-medium">Marketplace</span>
                            <p className="text-sm text-gray-500">Legal books and supplies</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
