import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Search, BookOpen, Filter } from 'lucide-react';

export default function LegalResearch() {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('All');
    const [laws, setLaws] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLaw, setSelectedLaw] = useState(null);

    const fetchLaws = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/laws/search', {
                params: { query, category }
            });
            setLaws(res.data);
        } catch (error) {
            console.error('Failed to fetch laws', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchLaws();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query, category]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-primary-900 font-serif">Legal Research Hub</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => axios.post('/laws/seed').then(() => fetchLaws())}
                        className="btn-secondary text-sm"
                    >
                        Seed Database
                    </button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="input-field pl-10"
                        placeholder="Search laws, acts, or sections..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            className="input-field pl-10"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="Criminal">Criminal</option>
                            <option value="Civil">Civil</option>
                            <option value="Corporate">Corporate</option>
                            <option value="Family">Family</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <p className="text-gray-500 col-span-full text-center py-8">Searching legal database...</p>
                ) : laws.length > 0 ? (
                    laws.map((law) => (
                        <div
                            key={law.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col"
                            onClick={() => setSelectedLaw(law)}
                        >
                            <div className="p-5 flex-grow">
                                <div className="flex items-start justify-between mb-2">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${law.category === 'Criminal' ? 'bg-red-100 text-red-800' :
                                            law.category === 'Civil' ? 'bg-blue-100 text-blue-800' :
                                                law.category === 'Corporate' ? 'bg-green-100 text-green-800' :
                                                    'bg-purple-100 text-purple-800'
                                        }`}>
                                        {law.category}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{law.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{law.description}</p>
                            </div>
                            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center text-primary-600 text-sm font-medium">
                                <BookOpen className="w-4 h-4 mr-2" />
                                Read Full Text
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
                        <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No laws found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your search terms or filters.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedLaw && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedLaw(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-2xl leading-6 font-bold text-gray-900 font-serif" id="modal-title">
                                            {selectedLaw.title}
                                        </h3>
                                        <div className="mt-4 prose max-w-none text-gray-700 max-h-[60vh] overflow-y-auto pr-2">
                                            <p className="whitespace-pre-wrap">{selectedLaw.content}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="btn-primary w-full sm:w-auto sm:ml-3"
                                    onClick={() => setSelectedLaw(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
