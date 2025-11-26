import { useState } from 'react';
import { createCase } from '../api/cases';
import { useNavigate } from 'react-router-dom';

export default function CreateCase() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        caseNumber: '',
        court: '',
        type: 'Civil',
        status: 'OPEN',
        nextHearingDate: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createCase(formData);
            navigate('/cases');
        } catch (error) {
            console.error('Failed to create case', error);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-primary-900 mb-8 font-serif border-b pb-4">Create New Case</h1>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Case Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="input-field mt-1"
                        placeholder="e.g. State vs. John Doe"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Case Number</label>
                    <input
                        type="text"
                        name="caseNumber"
                        value={formData.caseNumber}
                        onChange={handleChange}
                        className="input-field mt-1"
                        placeholder="e.g. CR-2023-001"
                    />
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Court</label>
                        <input
                            type="text"
                            name="court"
                            value={formData.court}
                            onChange={handleChange}
                            required
                            className="input-field mt-1"
                            placeholder="e.g. High Court"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="input-field mt-1"
                        >
                            <option>Civil</option>
                            <option>Criminal</option>
                            <option>Corporate</option>
                            <option>Family</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Next Hearing Date</label>
                    <input
                        type="date"
                        name="nextHearingDate"
                        value={formData.nextHearingDate}
                        onChange={handleChange}
                        className="input-field mt-1"
                    />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => navigate('/cases')}
                        className="btn-secondary mr-3"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                    >
                        Create Case
                    </button>
                </div>
            </form>
        </div>
    );
}
