import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Calendar, Clock, Check, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Appointments() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, CONFIRMED

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await axios.get('/appointments');
            setAppointments(res.data);
        } catch (error) {
            console.error('Failed to fetch appointments', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.put(`/appointments/${id}/status`, { status });
            // Optimistic update
            setAppointments(appointments.map(app =>
                app.id === id ? { ...app, status } : app
            ));
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update appointment status');
        }
    };

    const filteredAppointments = appointments.filter(app => {
        if (filter === 'ALL') return true;
        return app.status === filter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    if (loading) return <div className="p-6 text-center">Loading appointments...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Calendar className="w-6 h-6 mr-2" />
                    My Appointments
                </h1>
                <div className="flex space-x-2">
                    {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${filter === f ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                {filteredAppointments.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No appointments found.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {filteredAppointments.map((app) => (
                            <li key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.role === 'LAWYER' ? `Client: ${app.client.name}` : `Lawyer: ${app.lawyer.name}`}
                                            </div>
                                            <div className="text-sm text-gray-500 flex items-center mt-1">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {new Date(app.date).toLocaleString()}
                                            </div>
                                            {app.notes && (
                                                <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                                                    "{app.notes}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>

                                        {user.role === 'LAWYER' && app.status === 'PENDING' && (
                                            <div className="flex space-x-2 mt-2">
                                                <button
                                                    onClick={() => handleStatusUpdate(app.id, 'CONFIRMED')}
                                                    className="flex items-center px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                                                >
                                                    <Check className="w-3 h-3 mr-1" /> Accept
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(app.id, 'CANCELLED')}
                                                    className="flex items-center px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                                                >
                                                    <X className="w-3 h-3 mr-1" /> Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
