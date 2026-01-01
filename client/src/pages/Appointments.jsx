import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Calendar as CalendarIcon, Clock, Check, X, User, Phone, Mail, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/calendar.css';

export default function Appointments() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING'); // Default to PENDING
    const [date, setDate] = useState(null); // null = show all dates
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [viewMode, setViewMode] = useState('requests'); // 'requests' or 'calendar'

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await axios.get('/appointments');
            const sorted = res.data.map(app => ({
                ...app,
                dateObj: new Date(app.date)
            })).sort((a, b) => a.dateObj - b.dateObj); // Ascending by date
            setAppointments(sorted);
        } catch (error) {
            console.error('Failed to fetch appointments', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.put(`/appointments/${id}/status`, { status });
            setAppointments(appointments.map(app =>
                app._id === id ? { ...app, status } : app
            ));
            if (selectedAppointment && selectedAppointment._id === id) {
                setSelectedAppointment({ ...selectedAppointment, status });
            }
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update appointment status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    // Filter appointments
    const filteredAppointments = appointments.filter(app => {
        const matchesFilter = filter === 'ALL' || app.status === filter;
        const matchesDate = !date || app.dateObj.toDateString() === date.toDateString();
        return matchesFilter && matchesDate;
    });

    // Get pending count for badge
    const pendingCount = appointments.filter(a => a.status === 'PENDING').length;

    const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const hasAppt = appointments.some(app => isSameDay(app.dateObj, date));
            return hasAppt ? 'has-appointment' : null;
        }
    };

    if (loading) return <div className="p-6 text-center">Loading appointments...</div>;

    const otherParty = (app) => user.role === 'LAWYER' ? app.client : app.lawyer;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center font-serif">
                    <CalendarIcon className="w-6 h-6 mr-2" />
                    Appointment Manager
                </h1>
                
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => { setViewMode('requests'); setDate(null); setFilter('PENDING'); }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            viewMode === 'requests' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                        }`}
                    >
                        Requests
                        {pendingCount > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => { setViewMode('calendar'); setFilter('ALL'); }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            viewMode === 'calendar' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                        }`}
                    >
                        Calendar View
                    </button>
                </div>
            </div>

            {/* Pending Requests Alert for Lawyers */}
            {user.role === 'LAWYER' && pendingCount > 0 && viewMode === 'requests' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                    <span className="text-yellow-800">
                        You have <strong>{pendingCount} pending appointment request{pendingCount > 1 ? 's' : ''}</strong> that need your attention.
                    </span>
                </div>
            )}

            {viewMode === 'requests' ? (
                /* Requests View - List Style */
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                {f.charAt(0) + f.slice(1).toLowerCase()}
                                {f === 'PENDING' && pendingCount > 0 && (
                                    <span className="ml-1">({pendingCount})</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Appointments List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="font-bold text-gray-800 text-lg">
                                {filter === 'PENDING' ? 'Pending Requests' : `${filter === 'ALL' ? 'All' : filter} Appointments`}
                            </h2>
                            <p className="text-sm text-gray-500">{filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}</p>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {filteredAppointments.length === 0 ? (
                                <div className="p-12 text-center text-gray-400">
                                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                    <p className="font-medium">No appointments found</p>
                                </div>
                            ) : (
                                filteredAppointments.map((app) => {
                                    const party = otherParty(app);
                                    return (
                                        <div
                                            key={app._id}
                                            className="p-5 hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => setSelectedAppointment(app)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold text-lg">
                                                        {party?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-lg">
                                                            {party?.name || 'Unknown'}
                                                        </h3>
                                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                                            <CalendarIcon className="w-4 h-4 mr-1.5 text-primary-500" />
                                                            {app.dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                            <span className="mx-2">•</span>
                                                            <Clock className="w-4 h-4 mr-1 text-primary-500" />
                                                            {app.dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getStatusColor(app.status)}`}>
                                                        {app.status}
                                                    </span>
                                                    {user.role === 'LAWYER' && app.status === 'PENDING' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(app._id, 'CONFIRMED'); }}
                                                                className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                                                                title="Accept"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(app._id, 'CANCELLED'); }}
                                                                className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                                                                title="Reject"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {app.notes && (
                                                <p className="mt-2 ml-16 text-sm text-gray-500 italic truncate">
                                                    "{app.notes}"
                                                </p>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* Calendar View */
                <div className="grid lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <Calendar
                                onChange={(d) => setDate(d)}
                                value={date}
                                tileClassName={tileClassName}
                                className="w-full border-none font-sans"
                            />
                        </div>
                        <button 
                            onClick={() => setDate(null)}
                            className="w-full btn-secondary"
                        >
                            Show All Dates
                        </button>
                    </div>

                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="font-bold text-gray-800 text-lg">
                                    {date ? date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'All Appointments'}
                                </h2>
                                <p className="text-sm text-gray-500">{filteredAppointments.length} appointments</p>
                            </div>
                            <div className="p-6 space-y-4">
                                {filteredAppointments.length === 0 ? (
                                    <div className="text-center text-gray-400 py-12">
                                        <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                        <p>No appointments on this date</p>
                                    </div>
                                ) : (
                                    filteredAppointments.map((app) => {
                                        const party = otherParty(app);
                                        return (
                                            <div
                                                key={app._id}
                                                onClick={() => setSelectedAppointment(app)}
                                                className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-400 hover:shadow-lg transition-all cursor-pointer"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold text-lg">
                                                            {party?.name?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-900">{party?.name || 'Unknown'}</h3>
                                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                                <Clock className="w-4 h-4 mr-1.5 text-primary-500" />
                                                                {app.dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(app.status)}`}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {selectedAppointment && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setSelectedAppointment(null)}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div className="absolute top-0 right-0 pt-4 pr-4">
                                <button onClick={() => setSelectedAppointment(null)} className="text-gray-400 hover:text-gray-500">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 className="text-xl leading-6 font-bold text-gray-900 mb-1">
                                        Appointment Details
                                    </h3>

                                    <div className="bg-gray-50 rounded-lg p-4 mb-6 mt-4 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Date</p>
                                            <p className="text-sm font-medium">{selectedAppointment.dateObj.toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Time</p>
                                            <p className="text-sm font-medium">{selectedAppointment.dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                                            <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full mt-1 ${getStatusColor(selectedAppointment.status)}`}>
                                                {selectedAppointment.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 flex items-center mb-2">
                                                <User className="w-4 h-4 mr-2 text-primary-600" />
                                                {user.role === 'LAWYER' ? 'Client Information' : 'Lawyer Information'}
                                            </h4>
                                            <div className="bg-white border border-gray-200 rounded p-3 space-y-2 text-sm">
                                                <div className="flex items-center">
                                                    <span className="font-medium mr-2 w-16">Name:</span>
                                                    {otherParty(selectedAppointment)?.name || 'N/A'}
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="font-medium mr-2 w-16 flex items-center"><Mail className="w-3 h-3 mr-1" /> Email:</span>
                                                    {otherParty(selectedAppointment)?.email || 'N/A'}
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="font-medium mr-2 w-16 flex items-center"><Phone className="w-3 h-3 mr-1" /> Phone:</span>
                                                    {otherParty(selectedAppointment)?.phone || 'N/A'}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 flex items-center mb-2">
                                                <FileText className="w-4 h-4 mr-2 text-primary-600" />
                                                Notes
                                            </h4>
                                            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm text-gray-700 italic">
                                                "{selectedAppointment.notes || 'No notes provided.'}"
                                            </div>
                                        </div>
                                    </div>

                                    {user.role === 'LAWYER' && selectedAppointment.status === 'PENDING' && (
                                        <div className="mt-8 flex gap-3">
                                            <button
                                                onClick={() => handleStatusUpdate(selectedAppointment._id, 'CONFIRMED')}
                                                className="flex-1 btn-primary justify-center bg-green-600 hover:bg-green-700 border-transparent"
                                            >
                                                Accept Appointment
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(selectedAppointment._id, 'CANCELLED')}
                                                className="flex-1 btn-secondary justify-center text-red-600 border-red-200 hover:bg-red-50"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
