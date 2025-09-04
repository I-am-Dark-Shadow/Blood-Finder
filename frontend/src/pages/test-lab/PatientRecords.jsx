import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import ExportReportModal from '../../components/modals/ExportReportModal';

const PatientRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [isExportModalOpen, setExportModalOpen] = useState(false);

  const fetchRecords = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reports/patient-records?page=${page}`);
      setRecords(data.records);
      setPagination({ currentPage: data.currentPage, totalPages: data.totalPages });
    } catch (error) {
      toast.error("Failed to fetch patient records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchRecords(newPage);
    }
  };

  return (
    <div className="animate-fade-in bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      {/* Export Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Records</h2>
          <p className="text-sm text-gray-500">
            History of all completed tests
          </p>
        </div>
        <div>
          <button
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-medium shadow-sm hover:bg-red-700 transition"
          >
            <FileText size={16} /> Export Records
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
              <th className="px-4 py-3">Patient Name</th>
              <th className="px-4 py-3">Tests</th>
              <th className="px-4 py-3">Date Completed</th>
              <th className="px-4 py-3 text-right">Total Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-8 text-gray-500 italic"
                >
                  Loading records...
                </td>
              </tr>
            ) : records.length > 0 ? (
              records.map((rec) => (
                <tr
                  key={rec._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {rec.patient?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {rec.tests.join(", ")}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(rec.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    ₹{(rec.totalPrice || 0).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-8 text-gray-500 italic"
                >
                  No completed patient records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {records.length > 0 && pagination.totalPages > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-3">
          <span className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecords;
