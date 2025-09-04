import React, { useState } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

const TestRequestModal = ({ isOpen, onClose, testLab }) => {
  const { user } = useAuthStore();
  const [patientName, setPatientName] = useState(user.name);
  const [currentTest, setCurrentTest] = useState('');
  const [tests, setTests] = useState([]);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddTest = () => {
    if (currentTest.trim() !== '') {
      setTests([...tests, currentTest.trim()]);
      setCurrentTest('');
    }
  };

  const handleRemoveTest = (indexToRemove) => {
    setTests(tests.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tests.length === 0) {
      toast.error("Please add at least one test.");
      return;
    }

    const formData = new FormData();
    formData.append('testLabId', testLab._id);
    formData.append('patientName', patientName);
    tests.forEach((test) => formData.append('tests[]', test));
    if (prescription) {
      formData.append('prescription', prescription);
    }

    setLoading(true);
    try {
      const { data } = await api.post('/test-requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(data.message);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-lg bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-2xl border border-red-100 p-6 animate-fade-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-red-100 text-gray-600 hover:text-red-600 transition"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <h3 className="text-xl font-bold text-gray-900">New Test Request</h3>
        <p className="text-sm text-gray-500 mb-4">
          Requesting test at <span className="font-semibold text-red-600">{testLab.name}</span> ({testLab.city}, {testLab.zipcode})
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar pl-2"
        >
          {/* Patient Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              required
            />
          </div>

          {/* Tests Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tests Required</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentTest}
                onChange={(e) => setCurrentTest(e.target.value)}
                placeholder="e.g., Complete Blood Count"
                className="flex-grow px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddTest}
                className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Added Tests */}
            <div className="mt-3 flex flex-wrap gap-2">
              {tests.map((test, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-red-100 text-red-700 text-sm font-medium px-3 py-1 rounded-full shadow-sm"
                >
                  {test}
                  <button
                    type="button"
                    onClick={() => handleRemoveTest(index)}
                    className="hover:text-red-900"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Prescription Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Prescription (Optional, Image Only)
            </label>
            <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-400 hover:bg-red-50 transition">
              <Upload size={18} className="text-red-600 mr-2" />
              <span className="text-sm text-gray-600">
                {prescription ? prescription.name : 'Click to upload image'}
              </span>
              <input
                type="file"
                onChange={(e) => setPrescription(e.target.files[0])}
                className="hidden"
                accept="image/*" // <-- Only accept image files
              />
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestRequestModal;