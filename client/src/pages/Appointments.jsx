import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Calendar as CalendarIcon, Clock, Check, X, User, Phone, Mail, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/calendar.css';

export default function Appointments() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [date, setDate] = useState(new Date());
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await axios.get('/appointments');
            const sorted = res.data.map(app => ({
                ...app,
                dateObj: new Date(app.date)
            })).sort((a, b) => b.dateObj - a.dateObj);
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
                app.id === id ? { ...app, status } : app
            ));
            if (selectedAppointment && selectedAppointment.id === id) {
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

    const filteredAppointments = appointments.filter(app => {
        const matchesFilter = filter === 'ALL' || app.status === filter;
        const matchesDate = app.dateObj.toDateString() === date.toDateString();
        return matchesFilter && matchesDate;
    });

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
            <h1 className="text-2xl font-bold text-gray-900 flex items-center font-serif">
                <CalendarIcon className="w-6 h-6 mr-2" />
                Appointment Manager
            </h1>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Left Column: Calendar (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <Calendar
                            onChange={setDate}
                            value={date}
                            tileClassName={tileClassName}
                            className="w-full border-none font-sans"
                        />
                    </div>

                    {/* Optional: Summary Stats could go here instead of filters if needed, or just leave empty for clean look */}
                    <div className="bg-primary-50 rounded-xl p-5 border border-primary-100">
                        <h4 className="text-primary-900 font-semibold mb-2">Did you know?</h4>
                        <p className="text-sm text-primary-700">
                            You can click on any date to view appointments. The blue dots indicate scheduled meetings.
                        </p>
                    </div>
                </div>

                {/* Right Column: List & Filters (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Filters Tabs */}
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
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px] flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h2 className="font-bold text-gray-800 text-lg">
                                {date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h2>
                            <span className="text-sm text-gray-500 font-medium">
                                {filteredAppointments.length} Appointments
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {filteredAppointments.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <CalendarIcon className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No appointments found</p>
                                    <p className="text-sm text-gray-400">Try selecting a different date or filter</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredAppointments.map((app) => {
                                        const party = otherParty(app);
                                        return (
                                            <div
                                                key={app.id}
                                                onClick={() => setSelectedAppointment(app)}
                                                className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-400 hover:shadow-lg transition-all cursor-pointer"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold text-lg shadow-sm shrink-0">
                                                            {party.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors text-lg">
                                                                {party.name}
                                                            </h3>
                                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                                <Clock className="w-4 h-4 mr-1.5 text-primary-500" />
                                                                {app.dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                <span className="mx-2">•</span>
                                                                <span>{user.role === 'LAWYER' ? 'Client' : 'Lawyer'} Meeting</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getStatusColor(app.status)}`}>
                                                        {app.status}
                                                    </span>
                                                </div>

                                                {/* Hover indication arrow */}
                                                <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary-600">
                                                    <span className="text-xs font-medium">View Details &rarr;</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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
                                    <p className="text-sm text-gray-500 mb-6">
                                        ID: #{selectedAppointment.id}
                                    </p>

                                    <div className="bg-gray-50 rounded-lg p-4 mb-6 grid grid-cols-2 gap-4">
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
                                                    {otherParty(selectedAppointment).name}
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="font-medium mr-2 w-16 flex items-center"><Mail className="w-3 h-3 mr-1" /> Email:</span>
                                                    {otherParty(selectedAppointment).email}
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="font-medium mr-2 w-16 flex items-center"><Phone className="w-3 h-3 mr-1" /> Phone:</span>
                                                    {otherParty(selectedAppointment).phone || 'N/A'}
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
                                                onClick={() => handleStatusUpdate(selectedAppointment.id, 'CONFIRMED')}
                                                className="flex-1 btn-primary justify-center bg-green-600 hover:bg-green-700 border-transparent"
                                            >
                                                Accept Appointment
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(selectedAppointment.id, 'CANCELLED')}
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
