import React, { useState, useEffect } from 'react';
import { Edit2, Save, Upload } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const [profileData, setProfileData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const { user, login } = useAuthStore(); // Use login to update the store

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        if (data.dateOfBirth) {
          data.dateOfBirth = new Date(data.dateOfBirth).toISOString().split('T')[0];
        }
        setProfileData(data);
        setPreviewImage(data.profilePicture);
      } catch (error) {
        toast.error("Could not fetch profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    // Use FormData because we are sending a file
    const formData = new FormData();

    // Append all fields from profileData state
    Object.keys(profileData).forEach(key => {
      if (profileData[key]) {
        formData.append(key, profileData[key]);
      }
    });

    // Append the file if a new one was selected
    if (profilePictureFile) {
      formData.append('profilePicture', profilePictureFile);
    }

    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      login(data.user, useAuthStore.getState().token); // Update user in zustand store
      toast.success(data.message);
      setEditMode(false);
      setProfilePictureFile(null); // Clear the file state
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData.name) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">My Profile</h2>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium shadow hover:bg-red-700 transition"
            >
              <Edit2 size={16} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white font-medium shadow hover:bg-green-700 disabled:bg-green-400 transition"
              >
                <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium shadow hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={
                previewImage ||
                `https://ui-avatars.com/api/?name=${profileData.name}&background=fee2e2&color=dc2626`
              }
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-gray-200 shadow"
            />
            {editMode && (
              <label
                htmlFor="profilePicture"
                className="absolute -bottom-2 -right-2 bg-white border rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-50 transition"
              >
                <Upload size={18} className="text-gray-600" />
                <input
                  type="file"
                  id="profilePicture"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left column */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name || ''}
                onChange={handleInputChange}
                readOnly={!editMode}
                className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-100"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={profileData.email || ''}
                onChange={handleInputChange}
                readOnly={!editMode}
                className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-100"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone || ''}
                onChange={handleInputChange}
                readOnly={!editMode}
                className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-100"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={profileData.gender || ''}
                onChange={handleInputChange}
                disabled={!editMode}
                className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-100"
              >
                <option value="">Select Gender</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select
                name="bloodGroup"
                value={profileData.bloodGroup || ''}
                onChange={handleInputChange}
                disabled={!editMode}
                className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-100"
              >
                <option value="">Select Blood Group</option>
                <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={profileData.dateOfBirth || ''}
                onChange={handleInputChange}
                readOnly={!editMode}
                className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={profileData.address || ''}
                onChange={handleInputChange}
                readOnly={!editMode}
                className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-100"
                placeholder="Enter address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={profileData.city || ''}
                  onChange={handleInputChange}
                  readOnly={!editMode}
                  className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-100"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zipcode</label>
                <input
                  type="text"
                  name="zipcode"
                  value={profileData.zipcode || ''}
                  onChange={handleInputChange}
                  readOnly={!editMode}
                  className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:bg-gray-100"
                  placeholder="Enter zipcode"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default UserProfile;