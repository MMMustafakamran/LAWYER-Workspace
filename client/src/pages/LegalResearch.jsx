import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Search, BookOpen, Filter, X, Scale, Award } from 'lucide-react';

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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary-900">Legal Research Hub</h1>
                    <p className="text-slate-600 text-sm">Access comprehensive legal resources and case law</p>
                </div>
                <button
                    onClick={() => axios.post('/laws/seed').then(() => fetchLaws())}
                    className="btn-secondary text-sm"
                >
                    Seed Database
                </button>
            </div>

            {/* Search Bar - Matching Directory Style */}
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
                <div className="w-full md:w-56">
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
            <div>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-600">
                        {loading ? 'Searching...' : `${laws.length} ${laws.length === 1 ? 'result' : 'results'} found`}
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
                            <p className="text-slate-500">Searching legal database...</p>
                        </div>
                    ) : laws.length > 0 ? (
                        laws.map((law) => (
                            <div
                                key={law.id}
                                className="card group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                                onClick={() => setSelectedLaw(law)}
                            >
                                <div className="p-6 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${law.category === 'Criminal' ? 'bg-red-100 text-red-700' :
                                            law.category === 'Civil' ? 'bg-blue-100 text-blue-700' :
                                                law.category === 'Corporate' ? 'bg-green-100 text-green-700' :
                                                    'bg-purple-100 text-purple-700'
                                            }`}>
                                            {law.category}
                                        </span>
                                        <BookOpen className="w-5 h-5 text-slate-300 group-hover:text-primary-600 transition-colors" />
                                    </div>
                                    <h3 className="text-lg font-bold text-primary-900 mb-3 line-clamp-2 min-h-[3.5rem]">
                                        {law.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 line-clamp-3 flex-grow mb-4">
                                        {law.description}
                                    </p>
                                    <div className="flex items-center text-primary-700 text-sm font-medium pt-3 border-t border-gray-100">
                                        <Award className="w-4 h-4 mr-2" />
                                        Read Full Text
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <div className="card p-16 text-center border-2 border-dashed">
                                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <BookOpen className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">No laws found</h3>
                                <p className="text-sm text-slate-500">Try adjusting your search terms or filters.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {selectedLaw && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 bg-slate-900 bg-opacity-50 backdrop-blur-sm transition-opacity"
                            aria-hidden="true"
                            onClick={() => setSelectedLaw(null)}
                        ></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-primary-900 to-primary-800 px-6 py-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-accent-400 rounded-lg flex items-center justify-center">
                                        <Scale className="w-6 h-6 text-primary-900" />
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${selectedLaw.category === 'Criminal' ? 'bg-red-100 text-red-700' :
                                        selectedLaw.category === 'Civil' ? 'bg-blue-100 text-blue-700' :
                                            selectedLaw.category === 'Corporate' ? 'bg-green-100 text-green-700' :
                                                'bg-purple-100 text-purple-700'
                                        }`}>
                                        {selectedLaw.category}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedLaw(null)}
                                    className="text-primary-200 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-6">
                                <h3 className="text-2xl font-bold text-primary-900 mb-4" id="modal-title">
                                    {selectedLaw.title}
                                </h3>
                                <div className="prose max-w-none text-slate-700 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                    <p className="whitespace-pre-wrap leading-relaxed">{selectedLaw.content}</p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setSelectedLaw(null)}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn-primary"
                                >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Save to Library
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
