import React, { useState, useEffect } from 'react';
import { Edit2, Save, Upload } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const TestLabSettings = () => {
    const [labData, setLabData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const { login } = useAuthStore();

    useEffect(() => {
        const fetchLabProfile = async () => {
            try {
                const { data } = await api.get('/users/profile');
                setLabData(data);
                setPreviewImage(data.profilePicture);
            } catch (error) {
                toast.error("Could not fetch lab profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchLabProfile();
    }, []);

    const handleInputChange = (e) => setLabData({ ...labData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePictureFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSaveChanges = async () => {
        const formData = new FormData();
        Object.keys(labData).forEach(key => {
            if (labData[key]) formData.append(key, labData[key]);
        });
        if (profilePictureFile) {
            formData.append('profilePicture', profilePictureFile);
        }

        setLoading(true);
        try {
            const { data } = await api.put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            login(data.user, useAuthStore.getState().token);
            toast.success(data.message);
            setEditMode(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !labData.name) return <div>Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-lg p-6 border border-red-100">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Lab Settings</h2>
                    {!editMode ? (
                        <button
                            onClick={() => setEditMode(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white shadow-sm hover:bg-red-700 transition"
                        >
                            <Edit2 size={16} /> Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleSaveChanges}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white shadow-sm hover:bg-green-700 disabled:opacity-50 transition"
                            >
                                <Save size={16} /> Save
                            </button>
                            <button
                                onClick={() => setEditMode(false)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {/* Profile Picture */}
                {/* <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                        <img
                            src={previewImage || `https://ui-avatars.com/api/?name=${labData.name}&background=dbeafe&color=1e40af`}
                            alt="Lab Logo"
                            className="w-24 h-24 rounded-full object-cover border-4 border-red-200 shadow"
                        />
                        {editMode && (
                            <label
                                htmlFor="profilePicture"
                                className="absolute -bottom-2 -right-2 bg-white border border-gray-200 p-2 rounded-full shadow-md cursor-pointer hover:bg-red-50"
                            >
                                <Upload size={16} className="text-red-600" />
                            </label>
                        )}
                        <input
                            type="file"
                            id="profilePicture"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                </div> */}

                {/* Form */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Column 1 */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lab Name</label>
                            <input
                                type="text"
                                name="name"
                                value={labData.name || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                readOnly={!editMode}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lab Owner Name</label>
                            <input
                                type="text"
                                name="ownerName"
                                value={labData.ownerName || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                readOnly={!editMode}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={labData.phone || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                readOnly={!editMode}
                            />
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email</label>
                            <input
                                type="email"
                                name="email"
                                value={labData.email || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                readOnly={!editMode}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={labData.address || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                readOnly={!editMode}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={labData.city || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    readOnly={!editMode}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zipcode</label>
                                <input
                                    type="text"
                                    name="zipcode"
                                    value={labData.zipcode || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    readOnly={!editMode}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestLabSettings;
