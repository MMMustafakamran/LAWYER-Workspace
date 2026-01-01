import { useState } from 'react';
import { Search, BookOpen, User, Calendar, Award, Filter } from 'lucide-react';

const DUMMY_CASES = [
    {
        _id: '1',
        title: 'State vs. Ahmed Khan',
        citation: '2023 SCMR 124',
        court: 'Supreme Court of Pakistan',
        judge: 'Justice Qazi Faez Isa',
        date: '2023-05-15',
        keywords: ['Murder', 'Evidence', 'Forensic'],
        summary: 'Detailed judgment on the admissibility of forensic evidence in capital punishment cases where chain of custody is broken.'
    },
    {
        _id: '2',
        title: 'Fariha vs. Land Authority',
        citation: 'PLD 2022 Lahore 45',
        court: 'Lahore High Court',
        judge: 'Justice Ayesha Malik',
        date: '2022-11-20',
        keywords: ['Land Dispute', 'Inheritance', 'Women Rights'],
        summary: 'Landmark ruling securing inheritance rights for female heirs in agricultural land disputes against customary laws.'
    },
    {
        _id: '3',
        title: 'TechCorp vs. FBR',
        citation: '2024 PTD 89',
        court: 'Islamabad High Court',
        judge: 'Justice Athar Minallah',
        date: '2024-01-10',
        keywords: ['Taxation', 'Digital Services', 'Sales Tax'],
        summary: 'Clarification on sales tax applicability for remote digital services provided by non-resident companies.'
    },
    {
        _id: '4',
        title: 'Ali & Sons vs. Bank of Punjab',
        citation: '2021 CLD 332',
        court: 'Banking Court',
        judge: 'Justice Shahid Karim',
        date: '2021-08-05',
        keywords: ['Banking', 'Loan Default', 'Recovery'],
        summary: 'Interpretation of the Financial Institutions (Recovery of Finances) Ordinance regarding willful default.'
    },
    {
        _id: '5',
        title: 'Human Rights Case No. 1982',
        citation: 'PLD 2023 SC 99',
        court: 'Supreme Court of Pakistan',
        judge: 'Full Bench',
        date: '2023-03-01',
        keywords: ['Human Rights', 'Missing Persons', 'Constitutional Law'],
        summary: 'Suo moto notice implementation regarding enforced disappearances and state responsibility.'
    }
];

export default function CaseLaw() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCourt, setFilterCourt] = useState('All');

    const filteredCases = DUMMY_CASES.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              c.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase())) ||
                              c.summary.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCourt = filterCourt === 'All' || c.court.includes(filterCourt);
        return matchesSearch && matchesCourt;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-primary-900 font-serif">Case Law Library</h1>
                    <p className="text-gray-500">Search judgments, precedents, and citations.</p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
                <div className="flex-grow relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by title, keyword, or summary..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-gray-400 w-5 h-5" />
                    <select
                        className="border border-gray-300 rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-primary-500"
                        value={filterCourt}
                        onChange={(e) => setFilterCourt(e.target.value)}
                    >
                        <option value="All">All Courts</option>
                        <option value="Supreme Court">Supreme Court</option>
                        <option value="High Court">High Courts</option>
                        <option value="Banking">Banking Courts</option>
                    </select>
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid gap-6">
                {filteredCases.map((caseItem) => (
                    <div key={caseItem._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-xl font-bold text-primary-800 font-serif hover:underline cursor-pointer">
                                    {caseItem.title}
                                </h3>
                                <p className="text-sm font-semibold text-accent-600 mt-1">{caseItem.citation}</p>
                            </div>
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                {caseItem.court}
                            </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4 mt-2">
                            <div className="flex items-center">
                                <User className="w-4 h-4 mr-1" /> {caseItem.judge}
                            </div>
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" /> {caseItem.date}
                            </div>
                        </div>

                        <p className="text-gray-700 mb-4 italic p-3 bg-gray-50 rounded border-l-4 border-primary-300">
                            "{caseItem.summary}"
                        </p>

                        <div className="flex gap-2 flex-wrap">
                            {caseItem.keywords.map(kw => (
                                <span key={kw} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-100">
                                    #{kw}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}

                {filteredCases.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                        <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p>No cases found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
