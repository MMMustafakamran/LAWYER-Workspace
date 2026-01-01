import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Vote, CheckCircle, BarChart2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Elections() {
    const { user } = useAuth();
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newPoll, setNewPoll] = useState({
        question: '',
        barType: 'Lahore High Court Bar',
        candidateList: '',
        endDate: ''
    });

    useEffect(() => {
        fetchPolls();
    }, []);

    const fetchPolls = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/polls');
            setPolls(res.data);
        } catch (error) {
            console.error('Failed to fetch polls', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const candidates = newPoll.candidateList.split(',').map(c => c.trim());
            await axios.post('/polls', { ...newPoll, candidateList: candidates });
            setNewPoll({ question: '', barType: 'Lahore High Court Bar', candidateList: '', endDate: '' });
            setShowForm(false);
            fetchPolls();
        } catch (error) {
            console.error('Failed to create poll', error);
            alert('Failed to create poll: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleVote = async (pollId, choice) => {
        try {
            await axios.post('/polls/vote', { pollId, choice });
            fetchPolls(); // Refresh to show updated results
            alert('Vote cast successfully!');
        } catch (error) {
            console.error('Failed to vote', error);
            alert(error.response?.data?.message || 'Failed to cast vote');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary-900 font-serif">Bar Elections</h1>
                {(user.role === 'LAWYER' || user.role === 'SYSTEM_ADMIN') && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-primary flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Election
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 animate-fade-in">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Election</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Question / Title</label>
                            <input
                                type="text"
                                required
                                className="input-field mt-1"
                                placeholder="e.g. Annual President Election 2025"
                                value={newPoll.question}
                                onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bar Association</label>
                            <select
                                className="input-field mt-1"
                                value={newPoll.barType}
                                onChange={(e) => setNewPoll({ ...newPoll, barType: e.target.value })}
                            >
                                <option>Lahore High Court Bar</option>
                                <option>Islamabad Bar Association</option>
                                <option>Supreme Court Bar</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Candidates (comma separated)</label>
                            <input
                                type="text"
                                required
                                className="input-field mt-1"
                                placeholder="Candidate A, Candidate B, Candidate C"
                                value={newPoll.candidateList}
                                onChange={(e) => setNewPoll({ ...newPoll, candidateList: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <input
                                type="date"
                                required
                                className="input-field mt-1"
                                value={newPoll.endDate}
                                onChange={(e) => setNewPoll({ ...newPoll, endDate: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                                Create Election
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-6">
                {loading ? (
                    <p className="text-center py-8 text-gray-500">Loading elections...</p>
                ) : polls.length > 0 ? (
                    polls.map((poll) => {
                        const hasVoted = poll.votes.some(v => String(v.userId) === String(user.id));
                        const isEnded = new Date(poll.endDate) < new Date();

                        return (
                            <div key={poll._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-primary-100 text-primary-800 text-xs font-bold px-2 py-1 rounded-full">
                                                {poll.barType}
                                            </span>
                                            {isEnded && (
                                                <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                                                    Ended
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">{poll.question}</h3>
                                        <p className="text-sm text-gray-500">
                                            Ends: {new Date(poll.endDate).toLocaleDateString()} • Total Votes: {poll.totalVotes}
                                        </p>
                                    </div>
                                    <Vote className="h-8 w-8 text-gray-300" />
                                </div>

                                <div className="space-y-3">
                                    {poll.candidateList.map((candidate) => {
                                        const votes = poll.results[candidate] || 0;
                                        const percentage = poll.totalVotes > 0 ? Math.round((votes / poll.totalVotes) * 100) : 0;

                                        return (
                                            <div key={candidate} className="relative">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-gray-700">{candidate}</span>
                                                    <span className="text-sm text-gray-500">{percentage}% ({votes} votes)</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                                    <div
                                                        className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                {!hasVoted && !isEnded && (
                                                    <button
                                                        onClick={() => handleVote(poll._id, candidate)}
                                                        className="text-sm text-accent-600 hover:text-accent-700 font-medium"
                                                    >
                                                        Vote for {candidate}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {hasVoted && (
                                    <div className="mt-4 flex items-center text-green-600 text-sm font-medium bg-green-50 p-2 rounded">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        You have voted in this election.
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
                        <BarChart2 className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No active elections</h3>
                        <p className="mt-1 text-sm text-gray-500">Check back later for upcoming polls.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
