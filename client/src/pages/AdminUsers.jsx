import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Search, Shield, Ban, CheckCircle } from 'lucide-react';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await axios.put(`/admin/users/${userId}`, { role: newRole });
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error('Failed to update role', error);
            alert('Failed to update user role');
        }
    };

    const handleVerifyUser = async (userId, isVerified) => {
        try {
            await axios.put(`/admin/users/${userId}`, { isVerified });
            setUsers(users.map(u => u._id === userId ? { ...u, isVerified } : u));
        } catch (error) {
            console.error('Failed to verify user', error);
            alert('Failed to verify user');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [selectedUser, setSelectedUser] = useState(null);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 font-serif">User Management</h1>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    className="flex-grow outline-none text-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="4" className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'LAWYER' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'SYSTEM_ADMIN' ? 'bg-red-100 text-red-800' :
                                                    'bg-green-100 text-green-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.isVerified ? (
                                            <span className="text-green-600 flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> Verified</span>
                                        ) : 'Active'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {user.role === 'LITIGANT' && (
                                            <button
                                                onClick={() => handleRoleUpdate(user._id, 'LAWYER')}
                                                className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                            >
                                                <Shield className="w-4 h-4 mr-1" /> Make Lawyer
                                            </button>
                                        )}
                                        {user.role === 'LAWYER' && (
                                            <div className="flex flex-col gap-2 items-start">
                                                <button
                                                    onClick={() => setSelectedUser(user)} // Open Modal
                                                    className="text-blue-600 hover:text-blue-900 text-xs border border-blue-200 px-2 py-1 rounded"
                                                >
                                                    View Proof & Verify
                                                </button>
                                                <button
                                                    onClick={() => handleRoleUpdate(user._id, 'LITIGANT')}
                                                    className="text-orange-600 hover:text-orange-900 flex items-center text-xs"
                                                >
                                                    <Ban className="w-3 h-3 mr-1" /> Revoke Lawyer
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No users found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Verification Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedUser(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div>
                                <div className="mt-3 text-center sm:mt-5">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Verify Lawyer: {selectedUser.name}
                                    </h3>
                                    <div className="mt-4 text-left space-y-3">
                                        <div className="bg-gray-50 p-3 rounded border">
                                            <span className="block text-xs text-gray-500">CNIC Number</span>
                                            <span className="font-mono text-lg font-medium">
                                                {selectedUser.lawyerProfile?.cnic || 'Not Provided'}
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded border">
                                            <span className="block text-xs text-gray-500">Bar License Number</span>
                                            <span className="font-mono text-lg font-medium">
                                                {selectedUser.lawyerProfile?.licenseNumber || 'Not Provided'}
                                            </span>
                                        </div>
                                        
                                        <div className="bg-blue-50 p-3 rounded">
                                            <p className="text-sm text-blue-700">
                                                Please check these details against the official Bar Council records.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                                <button
                                    type="button"
                                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${selectedUser.isVerified ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm`}
                                    onClick={() => {
                                        handleVerifyUser(selectedUser._id, !selectedUser.isVerified);
                                        setSelectedUser(null);
                                    }}
                                >
                                    {selectedUser.isVerified ? 'Un-verify' : 'Approve & Verify'}
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:text-sm"
                                    onClick={() => setSelectedUser(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
