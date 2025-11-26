import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCaseById } from '../api/cases';
import { ArrowLeft, Calendar, FileText, User } from 'lucide-react';

export default function CaseDetails() {
    const { id } = useParams();
    const [caseItem, setCaseItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCase = async () => {
            try {
                const data = await getCaseById(id);
                setCaseItem(data);
            } catch (error) {
                console.error('Failed to fetch case details', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCase();
    }, [id]);

    if (loading) return <div>Loading case details...</div>;
    if (!caseItem) return <div>Case not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center">
                <Link to="/cases" className="mr-4 text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">{caseItem.title}</h1>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Case Information</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Details and documents.</p>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Case Number</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{caseItem.caseNumber}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Court</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{caseItem.court}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Type</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{caseItem.type}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${caseItem.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {caseItem.status}
                                </span>
                            </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Next Hearing</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {caseItem.nextHearingDate ? new Date(caseItem.nextHearingDate).toLocaleDateString() : 'N/A'}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Documents</h3>
                    <div className="mt-5">
                        {caseItem.documents && caseItem.documents.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {caseItem.documents.map((doc) => (
                                    <li key={doc.id} className="py-3 flex justify-between items-center">
                                        <div className="flex items-center">
                                            <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                            <span className="text-sm font-medium text-gray-900">Document #{doc.id}</span>
                                        </div>
                                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                                            View
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">No documents uploaded yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
