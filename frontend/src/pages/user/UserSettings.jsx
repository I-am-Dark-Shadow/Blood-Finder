import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import useAuthStore from '../../store/authStore.js';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import DeleteAccountModal from '../../components/modals/DeleteAccountModal.jsx'; // Import the modal

const UserSettings = () => {
    const { user, login, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    // This function now toggles the user's active status
    const handleToggleStatus = async () => {
        const action = user.isActive ? 'deactivate' : 'activate';
        if (window.confirm(`Are you sure you want to ${action} your account?`)) {
            try {
                // The backend endpoint is the same for both actions
                const { data } = await api.put('/users/deactivate');
                toast.success(data.message);
                
                // Update the user state in Zustand store with the latest data from API
                login(data.user, useAuthStore.getState().token);

            } catch (error) {
                toast.error(`Failed to ${action} account.`);
            }
        }
    };

    // This function will be passed to the modal
    const handleDeleteAccount = async (password) => {
        if (!password) {
            toast.error("Password is required to delete your account.");
            return;
        }
        try {
            const { data } = await api.delete('/users/profile', { 
                data: { password } // Pass password in the request body
            });
            toast.success(data.message);
            setDeleteModalOpen(false); // Close the modal
            logout(); // Log the user out
            navigate('/'); // Redirect to home
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete account.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            {/* The DeleteAccountModal is now controlled by this page's state */}
            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteAccount}
            />

            {/* Account Status - Now dynamic */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                {user.isActive ? (
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                            <div className="bg-green-100 rounded-full p-2 mr-3"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                            <div>
                                <p className="font-medium text-green-900">Account is Active</p>
                                <p className="text-sm text-green-700">You are available for donation requests.</p>
                            </div>
                        </div>
                        <button onClick={handleToggleStatus} className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-200 transition">
                            Deactivate
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                            <div className="bg-gray-100 rounded-full p-2 mr-3"><XCircle className="w-5 h-5 text-gray-600" /></div>
                            <div>
                                <p className="font-medium text-gray-900">Account is Inactive</p>
                                <p className="text-sm text-gray-700">You will not receive any notifications.</p>
                            </div>
                        </div>
                        <button onClick={handleToggleStatus} className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition">
                            Activate
                        </button>
                    </div>
                )}
            </div>
            
            {/* Change Password section has been removed */}

            {/* Danger Zone - Now functional */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-red-900">Delete Account</p>
                        <p className="text-sm text-red-700">Permanently delete your account and all associated data.</p>
                    </div>
                    <button onClick={() => setDeleteModalOpen(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserSettings;