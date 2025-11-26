import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { Users, Briefcase, BookOpen, Vote, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

    // Mock data for charts
    const userGrowthData = [
        { name: 'Jan', users: 4 },
        { name: 'Feb', users: 7 },
        { name: 'Mar', users: 12 },
        { name: 'Apr', users: 18 },
        { name: 'May', users: 25 },
        { name: 'Jun', users: stats.users || 30 },
    ];

    const caseStatusData = [
        { name: 'Open', value: stats.cases ? Math.floor(stats.cases * 0.7) : 10 },
        { name: 'Closed', value: stats.cases ? Math.ceil(stats.cases * 0.3) : 5 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">User Growth</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={userGrowthData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="users" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Case Status Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Case Status</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={caseStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {caseStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
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
