import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Check, X, FileText } from 'lucide-react';

const calculateAge = (dob) => {
  if (!dob) return 'N/A';
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const TestRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/test-lab/requests');
      setRequests(data.filter((req) => req.status === 'Pending'));
    } catch (error) {
      toast.error('Failed to fetch test requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/test-lab/requests/${id}/status`, { status });
      setRequests(requests.filter((r) => r._id !== id));
      toast.success(`Request has been ${status}.`);
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        🧾 Incoming Test Requests
      </h2>

      {loading ? (
        <p className="text-gray-600">Loading requests...</p>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">
            No Pending Requests
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You have no new test requests at the moment.
          </p>
        </div>
      ) : (
        requests.map((req) => (
          <div
            key={req._id}
            className="bg-gradient-to-r from-white to-red-50 border border-red-100 rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-6">
              {/* Patient Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {req.patient.name}
                </h3>
                <div className="space-y-2 mt-3 text-sm text-gray-700">
                  <p>
                    <strong className="text-gray-900">Tests:</strong>{' '}
                    {req.tests.join(', ')}
                  </p>
                  <p className="flex items-center gap-2">
                    <User size={14} className="text-red-600" />
                    <span>
                      <strong>Age:</strong> {calculateAge(req.patient.dateOfBirth)},{' '}
                      <strong>Gender:</strong> {req.patient.gender || 'N/A'}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={14} className="text-red-600" />
                    <span>
                      <strong>Contact:</strong> {req.patient.phone || 'N/A'}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail size={14} className="text-red-600" />
                    <span>
                      <strong>Address:</strong> {req.patient.address || 'N/A'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-stretch md:items-end gap-3 w-full md:w-auto">
                {req.prescriptionUrl && (
                  <a
                    href={req.prescriptionUrl}
                    target="_blank" // Opens in a new tab
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 shadow-sm hover:bg-gray-50 transition"
                  >
                    <FileText size={16} /> View Prescription
                  </a>
                )}

                {req.status === 'Pending' && (
                  <div className="flex gap-3 w-full md:w-auto">
                    <button
                      onClick={() => handleStatusUpdate(req._id, 'Approved')}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow transition"
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(req._id, 'Rejected')}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow transition"
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TestRequests;