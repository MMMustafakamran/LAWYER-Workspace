import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { Search, MapPin, Briefcase, Star } from 'lucide-react';

export default function LawyerDirectory() {
    const [lawyers, setLawyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        specialization: 'All',
        location: ''
    });

    useEffect(() => {
        fetchLawyers();
    }, [filters]);

    const fetchLawyers = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.specialization !== 'All') params.specialization = filters.specialization;
            if (filters.location) params.location = filters.location;

            const res = await axios.get('/lawyers', { params });
            setLawyers(res.data);
        } catch (error) {
            console.error('Failed to fetch lawyers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary-900 font-serif">Find a Lawyer</h1>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            name="location"
                            className="input-field pl-10"
                            placeholder="Filter by location (e.g. Lahore)"
                            value={filters.location}
                            onChange={handleFilterChange}
                        />
                    </div>
                </div>
                <div className="w-full md:w-64">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Briefcase className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            name="specialization"
                            className="input-field pl-10"
                            value={filters.specialization}
                            onChange={handleFilterChange}
                        >
                            <option value="All">All Specializations</option>
                            <option value="Criminal">Criminal Law</option>
                            <option value="Civil">Civil Litigation</option>
                            <option value="Corporate">Corporate Law</option>
                            <option value="Family">Family Law</option>
                            <option value="Property">Property Law</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <p className="col-span-full text-center py-8 text-gray-500">Loading directory...</p>
                ) : lawyers.length > 0 ? (
                    lawyers.map((lawyer) => (
                        <div key={lawyer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
                                        {lawyer.name.charAt(0)}
                                    </div>
                                    {lawyer.lawyerProfile?.rating > 0 && (
                                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-yellow-700 text-xs font-bold">
                                            <Star className="w-3 h-3 mr-1 fill-current" />
                                            {lawyer.lawyerProfile.rating}
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{lawyer.name}</h3>
                                <p className="text-sm text-primary-600 font-medium mb-3">
                                    {lawyer.lawyerProfile?.specialization || 'General Practice'}
                                </p>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                    {lawyer.lawyerProfile?.bio || 'No bio available.'}
                                </p>
                                <div className="flex items-center text-xs text-gray-500 mb-4">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {lawyer.lawyerProfile?.location || 'Location not specified'}
                                </div>
                                <Link
                                    to={`/lawyers/${lawyer.id}`}
                                    className="block w-full text-center btn-secondary"
                                >
                                    View Profile
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
                        <Briefcase className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No lawyers found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
