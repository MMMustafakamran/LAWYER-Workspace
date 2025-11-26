import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="mt-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p><strong>Name:</strong> {user?.name}</p>
                            <p><strong>Email:</strong> {user?.email}</p>
                            <p><strong>Role:</strong> {user?.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
