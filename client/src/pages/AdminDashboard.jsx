import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { Users, Briefcase, BookOpen, Vote, Shield } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        lawyers: 0,
        cases: 0,
        laws: 0,
        polls: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/admin/stats');
                setStats(res.data);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
            <div className={`p-3 rounded-full mr-4 ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );

    if (loading) return <div className="text-center py-12">Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 font-serif">Admin Dashboard</h1>
                <Link to="/admin/users" className="btn-primary flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.users}
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Active Lawyers"
                    value={stats.lawyers}
                    icon={Shield}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Total Cases"
                    value={stats.cases}
                    icon={Briefcase}
                    color="bg-green-500"
                />
                <StatCard
                    title="Laws Indexed"
                    value={stats.laws}
                    icon={BookOpen}
                    color="bg-yellow-500"
                />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">System Health</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded border border-gray-100">
                        <p className="text-sm text-gray-500">Active Polls</p>
                        <p className="text-xl font-bold text-gray-900">{stats.polls}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded border border-gray-100">
                        <p className="text-sm text-gray-500">Server Status</p>
                        <p className="text-xl font-bold text-green-600">Online</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
