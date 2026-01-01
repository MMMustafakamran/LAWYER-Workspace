import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, Save, Lock, Globe } from 'lucide-react';

export default function Profile() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Password change
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    // Lawyer profile fields
    const [lawyerData, setLawyerData] = useState({
        specialization: '',
        experience: '',
        bio: '',
        location: '',
        hourlyRate: '',
        cnic: '',
        licenseNumber: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('/profile');
            setProfile(res.data);
            if (res.data.lawyerProfile) {
                setLawyerData({
                    specialization: res.data.lawyerProfile.specialization || '',
                    experience: res.data.lawyerProfile.experience || '',
                    bio: res.data.lawyerProfile.bio || '',
                    location: res.data.lawyerProfile.location || '',
                    hourlyRate: res.data.lawyerProfile.hourlyRate || '',
                    cnic: res.data.lawyerProfile.cnic || '',
                    licenseNumber: res.data.lawyerProfile.licenseNumber || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const res = await axios.put('/profile', {
                name: profile.name,
                phone: profile.phone
            });
            setMessage('Profile updated successfully!');
            // Update context
            if (setUser) setUser(prev => ({ ...prev, name: res.data.name }));
        } catch (error) {
            setMessage('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleLawyerProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await axios.put('/lawyers/profile', lawyerData);
            setMessage('Lawyer profile updated successfully!');
        } catch (error) {
            setMessage('Failed to update lawyer profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage('Passwords do not match!');
            return;
        }
        setSaving(true);
        setMessage('');
        try {
            await axios.put('/profile/password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            setMessage('Password changed successfully!');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    const handleLanguageChange = async (lang) => {
        try {
            await axios.put('/profile/language', { language: lang });
            setProfile({ ...profile, language: lang });
            setMessage('Language updated!');
        } catch (error) {
            setMessage('Failed to update language');
        }
    };

    if (loading) return <div className="text-center py-12">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-primary-900">My Profile</h1>

            {message && (
                <div className={`p-4 rounded-lg ${message.includes('Failed') || message.includes('match') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message}
                </div>
            )}

            {/* Basic Info */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Basic Information
                </h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                className="input-field mt-1"
                                value={profile?.name || ''}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                className="input-field mt-1 bg-gray-100"
                                value={profile?.email || ''}
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="text"
                                className="input-field mt-1"
                                value={profile?.phone || ''}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <input
                                type="text"
                                className="input-field mt-1 bg-gray-100"
                                value={profile?.role || ''}
                                disabled
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={saving} className="btn-primary">
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>

            {/* Lawyer Profile (only for lawyers) */}
            {profile?.role === 'LAWYER' && (
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-primary-900 mb-4">Lawyer Profile</h2>
                    <form onSubmit={handleLawyerProfileUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Specialization</label>
                                <select
                                    className="input-field mt-1"
                                    value={lawyerData.specialization}
                                    onChange={(e) => setLawyerData({ ...lawyerData, specialization: e.target.value })}
                                >
                                    <option value="">Select...</option>
                                    <option value="Criminal">Criminal</option>
                                    <option value="Civil">Civil</option>
                                    <option value="Family">Family</option>
                                    <option value="Corporate">Corporate</option>
                                    <option value="Property">Property</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                                <input
                                    type="number"
                                    className="input-field mt-1"
                                    value={lawyerData.experience}
                                    onChange={(e) => setLawyerData({ ...lawyerData, experience: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Location</label>
                                <input
                                    type="text"
                                    className="input-field mt-1"
                                    placeholder="e.g. Lahore, Karachi"
                                    value={lawyerData.location}
                                    onChange={(e) => setLawyerData({ ...lawyerData, location: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hourly Rate (PKR)</label>
                                <input
                                    type="number"
                                    className="input-field mt-1"
                                    value={lawyerData.hourlyRate}
                                    onChange={(e) => setLawyerData({ ...lawyerData, hourlyRate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">CNIC (Verification)</label>
                                <input
                                    type="text"
                                    className="input-field mt-1"
                                    placeholder="XXXXX-XXXXXXX-X"
                                    value={lawyerData.cnic}
                                    onChange={(e) => setLawyerData({ ...lawyerData, cnic: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Bar License No.</label>
                                <input
                                    type="text"
                                    className="input-field mt-1"
                                    placeholder="LB-XXXX"
                                    value={lawyerData.licenseNumber}
                                    onChange={(e) => setLawyerData({ ...lawyerData, licenseNumber: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bio</label>
                            <textarea
                                className="input-field mt-1"
                                rows="3"
                                placeholder="Tell clients about yourself..."
                                value={lawyerData.bio}
                                onChange={(e) => setLawyerData({ ...lawyerData, bio: e.target.value })}
                            ></textarea>
                        </div>
                        <button type="submit" disabled={saving} className="btn-primary">
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Update Lawyer Profile'}
                        </button>
                    </form>
                </div>
            )}

            {/* Change Password */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Change Password
                </h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Password</label>
                            <input
                                type="password"
                                className="input-field mt-1"
                                value={passwords.currentPassword}
                                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                className="input-field mt-1"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input
                                type="password"
                                className="input-field mt-1"
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={saving} className="btn-secondary">
                        {saving ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </div>

            {/* Language */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Language Preference
                </h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleLanguageChange('en')}
                        className={`px-4 py-2 rounded-lg border ${profile?.language === 'en' ? 'bg-primary-100 border-primary-500' : 'border-gray-300'}`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => handleLanguageChange('ur')}
                        className={`px-4 py-2 rounded-lg border ${profile?.language === 'ur' ? 'bg-primary-100 border-primary-500' : 'border-gray-300'}`}
                    >
                        اردو (Urdu)
                    </button>
                </div>
            </div>
        </div>
    );
}
