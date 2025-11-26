import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Briefcase, BookOpen, Users, TrendingUp, Plus, FileText, Calendar } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();

    const stats = [
        { name: 'Active Cases', value: '12', icon: Briefcase, change: '+2', color: 'bg-primary-700' },
        { name: 'Research Items', value: '48', icon: BookOpen, change: '+8', color: 'bg-primary-600' },
        { name: 'Clients', value: '24', icon: Users, change: '+3', color: 'bg-primary-800' },
        { name: 'Success Rate', value: '87%', icon: TrendingUp, change: '+5%', color: 'bg-accent-400' },
    ];

    const quickActions = [
        { name: 'New Case', icon: Plus, href: '/cases/create', color: 'bg-primary-900' },
        { name: 'Research', icon: BookOpen, href: '/research', color: 'bg-primary-700' },
        { name: 'Documents', icon: FileText, href: '/cases', color: 'bg-primary-600' },
        { name: 'Calendar', icon: Calendar, href: '/cases', color: 'bg-accent-500' },
    ];

    const recentActivity = [
        { id: 1, action: 'Case #1234 updated', time: '2 hours ago' },
        { id: 2, action: 'New document uploaded', time: '4 hours ago' },
        { id: 3, action: 'Hearing scheduled for tomorrow', time: '1 day ago' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary-900">Welcome back, {user?.name}!</h1>
                    <p className="text-slate-600 text-sm capitalize">Your {user?.role || 'User'} Dashboard</p>
                </div>
                <Link to="/cases/create" className="btn-accent">
                    <Plus className="w-4 h-4 mr-2" />
                    New Case
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="card p-5 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">{stat.name}</p>
                                <p className="text-2xl font-bold text-primary-900 mt-1">{stat.value}</p>
                                <p className="text-xs text-green-600 mt-1">{stat.change} this month</p>
                            </div>
                            <div className={`${stat.color} p-2.5 rounded-lg`}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-2 card p-5">
                    <h2 className="text-lg font-semibold text-primary-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {quickActions.map((action) => (
                            <Link
                                key={action.name}
                                to={action.href}
                                className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                            >
                                <div className={`${action.color} p-2.5 rounded-lg mb-2 group-hover:scale-110 transition-transform`}>
                                    <action.icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xs font-medium text-slate-700">{action.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card p-5">
                    <h2 className="text-lg font-semibold text-primary-900 mb-4">Recent Activity</h2>
                    <div className="space-y-3">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-accent-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{activity.action}</p>
                                    <p className="text-xs text-slate-500">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
