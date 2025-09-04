import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const TestFormModal = ({ isOpen, onClose, onSave, testToEdit }) => {
  const initialState = {
    testName: "",
    category: "",
    price: "",
    duration: "",
    status: "Active",
  };
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (testToEdit) {
      setFormData({
        testName: testToEdit.testName || "",
        category: testToEdit.category || "",
        price: testToEdit.price || "",
        duration: testToEdit.duration || "",
        status: testToEdit.status || "Active",
      });
    } else {
      setFormData(initialState);
    }
  }, [testToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {testToEdit ? "✏️ Edit Test" : "➕ Add New Test"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Test Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Name
            </label>
            <input
              type="text"
              name="testName"
              value={formData.testName}
              onChange={handleChange}
              placeholder="e.g., Blood Sugar Test"
              className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Biochemistry"
              className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              required
            />
          </div>

          {/* Price + Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g., 500"
                className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 2-4 Hours"
                className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-5 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium shadow-sm hover:bg-red-700 transition disabled:bg-red-400"
            >
              {loading ? "Saving..." : "Save Test"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestFormModal;
