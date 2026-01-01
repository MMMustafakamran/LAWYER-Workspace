import { useState, useRef, useEffect } from 'react';
import { Upload, X, FileText, Crop as CropIcon, Check } from 'lucide-react';
import axios from '../api/axios';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Build a centered crop
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight,
    )
}

export default function DocumentUpload({ caseId, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [originalImgSrc, setOriginalImgSrc] = useState(null); // For the editor
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Editor State
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);

    const imgRef = useRef(null);
    const previewCanvasRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError('');

            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                    setOriginalImgSrc(reader.result);
                    setIsEditing(true); // Open editor immediately for images
                    setRotate(0);
                    setScale(1);
                    setBrightness(100);
                    setContrast(100);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setOriginalImgSrc(null);
                setIsEditing(false);
            }
        }
    };

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        const newCrop = centerAspectCrop(width, height, 8.5 / 11); // standard paper aspect
        setCrop(newCrop);
        setCompletedCrop(newCrop);
    };

    const applyEdits = async () => {
        if (!completedCrop || !imgRef.current || !previewCanvasRef.current) return;

        const image = imgRef.current;
        const canvas = previewCanvasRef.current;
        const crop = completedCrop;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const ctx = canvas.getContext('2d');
        const pixelRatio = window.devicePixelRatio;

        canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
        canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

        ctx.scale(pixelRatio, pixelRatio);
        ctx.imageSmoothingQuality = 'high';

        const cropX = crop.x * scaleX;
        const cropY = crop.y * scaleY;

        const centerX = image.naturalWidth / 2;
        const centerY = image.naturalHeight / 2;

        ctx.save();

        // Apply filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

        // Move to crop center
        ctx.translate(-cropX, -cropY);
        ctx.translate(centerX, centerY);
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);

        ctx.drawImage(
            image,
            0,
            0,
            image.naturalWidth,
            image.naturalHeight,
            0,
            0,
            image.naturalWidth,
            image.naturalHeight,
        );

        ctx.restore();

        // Convert to blob
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Canvas is empty');
                    return;
                }
                // Create a new File object
                const editedFile = new File([blob], file.name, { type: 'image/jpeg' });
                setFile(editedFile);
                setIsEditing(false);
                resolve();
            }, 'image/jpeg', 0.95);
        });
    }

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
            setOriginalImgSrc(null);
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
        setOriginalImgSrc(null);
        setIsEditing(false);
    };

    return (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-primary-900 font-serif mb-4">Upload Document</h3>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            {/* Editor Modal / Inline */}
            {isEditing && originalImgSrc ? (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                            <CropIcon className="w-4 h-4" /> Document Enhancement
                        </h4>
                        <button onClick={clearFile} className="text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="max-h-[60vh] overflow-auto bg-gray-900 flex justify-center p-4 rounded">
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={undefined}
                        >
                            <img
                                ref={imgRef}
                                src={originalImgSrc}
                                onLoad={onImageLoad}
                                style={{
                                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                                    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                                    maxWidth: '100%',
                                    maxHeight: '50vh'
                                }}
                                alt="Upload"
                            />
                        </ReactCrop>
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded text-sm">
                        <div className="space-y-1">
                            <label className="text-gray-600 font-medium">Brightness: {brightness}%</label>
                            <input
                                type="range" min="0" max="200" value={brightness}
                                onChange={(e) => setBrightness(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-gray-600 font-medium">Contrast: {contrast}%</label>
                            <input
                                type="range" min="0" max="200" value={contrast}
                                onChange={(e) => setContrast(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-gray-600 font-medium">Rotation: {rotate}°</label>
                            <input
                                type="range" min="-180" max="180" value={rotate}
                                onChange={(e) => setRotate(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                        <div className="flex items-end">
                            <button onClick={() => setRotate(rotate - 90)} className="text-xs btn-secondary mr-2">-90°</button>
                            <button onClick={() => setRotate(rotate + 90)} className="text-xs btn-secondary">+90°</button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button onClick={clearFile} className="btn-secondary">Cancel</button>
                        <button onClick={applyEdits} className="btn-primary flex items-center">
                            <Check className="w-4 h-4 mr-2" /> Save Edits
                        </button>
                    </div>

                    {/* Hidden Canvas for processing */}
                    <canvas ref={previewCanvasRef} className="hidden" />
                </div>
            ) : !file ? (
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary-500 transition-colors">
                    <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex flex-col gap-2 text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,application/pdf" />
                            </label>
                            
                            <div className="flex items-center gap-2 justify-center my-2">
                                <span className="h-px bg-gray-300 w-12"></span>
                                <span className="text-gray-400 text-xs">OR</span>
                                <span className="h-px bg-gray-300 w-12"></span>
                            </div>

                            <label htmlFor="camera-upload" className="relative cursor-pointer bg-primary-50 py-2 px-4 rounded-md font-medium text-primary-700 hover:bg-primary-100 transition-colors flex items-center justify-center gap-2">
                                <div className="w-5 h-5 rounded-full border-2 border-primary-600"></div>
                                <span>Scan Document</span>
                                <input id="camera-upload" type="file" className="sr-only" capture="environment" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">PNG, JPG, PDF up to 5MB</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-3">
                            <FileText className="h-10 w-10 text-gray-400" />
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
