import { useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import axios from '../api/axios';

export default function DocumentUpload({ caseId, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError('');

            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setPreview(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setError('');

        try {
            await axios.post(`/cases/${caseId}/documents`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setFile(null);
            setPreview(null);
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            console.error('Upload failed', err);
            setError('Failed to upload document. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
    };

    return (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-primary-900 font-serif mb-4">Upload Document</h3>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            {!file ? (
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary-500 transition-colors">
                    <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,application/pdf" />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-3">
                            {preview ? (
                                <img src={preview} alt="Preview" className="h-10 w-10 object-cover rounded" />
                            ) : (
                                <FileText className="h-10 w-10 text-gray-400" />
                            )}
                            <div>
                                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button onClick={clearFile} className="text-gray-400 hover:text-gray-500">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className={`w-full btn-primary justify-center ${uploading ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        {uploading ? 'Uploading...' : 'Upload Document'}
                    </button>
                </div>
            )}
        </div>
    );
}
