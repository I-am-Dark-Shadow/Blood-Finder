import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { UploadCloud, FileText, X } from 'lucide-react';

const UploadPrescription = () => {
    const [files, setFiles] = useState([]);

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles([...files, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (fileName) => {
        setFiles(files.filter(file => file.name !== fileName));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (files.length === 0) {
            toast.error("Please upload at least one prescription file.");
            return;
        }
        toast.success("Prescription submitted successfully!");
        // Here you would typically upload files and form data
        setFiles([]);
        e.target.reset();
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-lg border p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <input type="text" placeholder="Patient Name" className="input-field" required />
                        <input type="email" placeholder="Patient Email" className="input-field" required />
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Prescription Upload</h3>
                    <div className="dropzone border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <UploadCloud className="w-12 h-12 text-gray-400 mx-auto" />
                        <p className="mt-4 text-lg text-gray-600">Drop files here or <label htmlFor="fileInput" className="text-red-600 hover:text-red-700 font-medium cursor-pointer">click to browse</label></p>
                        <input type="file" id="fileInput" multiple onChange={handleFileChange} className="hidden" />
                    </div>
                    <div id="uploadedFiles" className="mt-4 space-y-2">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center"><FileText className="w-5 h-5 text-gray-400 mr-3" /><span className="text-sm font-medium">{file.name}</span></div>
                                <button type="button" onClick={() => removeFile(file.name)} className="text-red-600 hover:text-red-700"><X size={16} /></button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Submit Prescription</button>
                </div>
            </form>
        </div>
    );
};
export default UploadPrescription;