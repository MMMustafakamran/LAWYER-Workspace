import { useEffect, useState } from 'react';
import { getCases } from '../api/cases';
import { Link } from 'react-router-dom';
import { Plus, Folder } from 'lucide-react';

export default function CaseList() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const data = await getCases();
                setCases(data);
            } catch (error) {
                console.error('Failed to fetch cases', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCases();
    }, []);

    if (loading) return <div>Loading cases...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary-900">My Cases</h2>
                <Link
                    to="/cases/new"
                    className="btn-primary"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Case
                </Link>
            </div>

            {cases.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <Folder className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No cases</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new case.</p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {cases.map((caseItem) => (
                            <li key={caseItem.id}>
                                <Link to={`/cases/${caseItem.id}`} className="block hover:bg-gray-50 transition-colors">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-lg font-bold text-primary-700 truncate font-serif">{caseItem.title}</p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${caseItem.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {caseItem.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    {caseItem.caseNumber}
                                                </p>
                                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                    {caseItem.court}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <p>
                                                    Next Hearing: {caseItem.nextHearingDate ? new Date(caseItem.nextHearingDate).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
