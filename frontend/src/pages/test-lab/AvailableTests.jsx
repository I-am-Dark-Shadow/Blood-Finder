import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit } from 'lucide-react';
import TestFormModal from '../../components/modals/TestFormModal';

const AvailableTests = () => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [testToEdit, setTestToEdit] = useState(null);

    const fetchTests = async () => {
        try {
            const { data } = await api.get('/test-lab/tests');
            setTests(data);
        } catch (error) {
            toast.error("Failed to fetch available tests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    const handleOpenModal = (test = null) => {
        setTestToEdit(test);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setTestToEdit(null);
    };

    const handleSaveTest = async (formData) => {
        try {
            if (testToEdit) {
                const { data } = await api.put(`/test-lab/tests/${testToEdit._id}`, formData);
                setTests(tests.map(t => t._id === testToEdit._id ? data : t));
                toast.success("Test updated successfully!");
            } else {
                const { data } = await api.post('/test-lab/tests', formData);
                setTests([data, ...tests]);
                toast.success("New test added successfully!");
            }
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save test.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this test?")) {
            try {
                await api.delete(`/test-lab/tests/${id}`);
                setTests(tests.filter(t => t._id !== id));
                toast.success("Test deleted successfully.");
            } catch (error) {
                toast.error("Failed to delete test.");
            }
        }
    };

    return (
        <div className="animate-fade-in bg-white rounded-lg border p-6">
            <TestFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveTest}
                testToEdit={testToEdit}
            />

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Available Lab Tests</h3>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium shadow-md hover:from-red-600 hover:to-pink-600 transition-all flex items-center gap-2"
                >
                    <Plus size={18} className="stroke-[2.5]" />
                    Add New Test
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-100 text-gray-700 text-sm">
                        <tr>
                            <th className="px-4 py-3 text-left">Test Name</th>
                            <th className="px-4 py-3 text-left">Category</th>
                            <th className="px-4 py-3 text-right">Price (₹)</th>
                            <th className="px-4 py-3 text-center">Duration</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-6 text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : tests.length > 0 ? (
                            tests.map((test) => (
                                <tr key={test._id} className="hover:bg-gray-50 text-sm">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {test.testName}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">{test.category}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                        ₹{Number(test.price).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-600">
                                        {test.duration} Hrs
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${test.status === "Active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {test.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => handleOpenModal(test)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(test._id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="text-center py-6 text-gray-500 italic"
                                >
                                    No tests available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AvailableTests;
