import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { MapPin, Briefcase, Star, Phone, Mail, Clock, Award } from 'lucide-react';

export default function LawyerProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lawyer, setLawyer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`/lawyers/${id}`);
                setLawyer(res.data);
            } catch (error) {
                console.error('Failed to fetch profile', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (loading) return <div className="text-center py-12">Loading profile...</div>;
    if (!lawyer) return <div className="text-center py-12">Lawyer not found</div>;

    const profile = lawyer.lawyerProfile || {};

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-primary-900 h-32"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="h-24 w-24 rounded-full bg-white p-1 shadow-md">
                            <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-3xl font-bold">
                                {lawyer.name.charAt(0)}
                            </div>
                        </div>
                        <button className="btn-primary shadow-lg">
                            Contact Lawyer
                        </button>
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">{lawyer.name}</h1>
                        <p className="text-lg text-primary-600 font-medium mb-4">
                            {profile.specialization || 'Legal Practitioner'}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                            <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {profile.location || 'Location not specified'}
                            </div>
                            <div className="flex items-center">
                                <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                                {profile.rating || 'New'} ({profile.reviewCount || 0} reviews)
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {profile.experience ? `${profile.experience} Years Exp.` : 'Experience not listed'}
                            </div>
                            {profile.hourlyRate && (
                                <div className="flex items-center font-semibold text-gray-900">
                                    <Award className="w-4 h-4 mr-1" />
                                    ${profile.hourlyRate}/hr
                                </div>
                            )}
                        </div>

                        <div className="prose max-w-none text-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">About</h3>
                            <p>{profile.bio || 'No biography provided.'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Phone className="w-5 h-5 mr-2 text-primary-600" />
                        Contact Information
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                            <Mail className="w-4 h-4 mr-3" />
                            {lawyer.email}
                        </div>
                        {lawyer.phone && (
                            <div className="flex items-center text-gray-600">
                                <Phone className="w-4 h-4 mr-3" />
                                {lawyer.phone}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Cases (Public) */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-primary-600" />
                        Recent Activity
                    </h3>
                    {lawyer.casesAsLawyer && lawyer.casesAsLawyer.length > 0 ? (
                        <ul className="space-y-3">
                            {lawyer.casesAsLawyer.slice(0, 3).map(c => (
                                <li key={c.id} className="text-sm border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                    <span className="font-medium text-gray-900">{c.title}</span>
                                    <span className="block text-xs text-gray-500">{c.status}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">No public cases listed.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
