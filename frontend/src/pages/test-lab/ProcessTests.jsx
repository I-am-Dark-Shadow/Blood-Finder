import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { User, CheckCircle, FlaskConical, Droplet } from 'lucide-react';

const ProcessTests = () => {
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovedRequests = async () => {
    try {
      const { data } = await api.get('/test-lab/requests/processable');
      setApprovedRequests(data);
    } catch (error) {
      toast.error('Failed to fetch approved requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedRequests();
  }, []);

  const handleMarkComplete = async (id) => {
    if (
      window.confirm(
        'Are you sure this test is complete? This will make the patient available for billing.'
      )
    ) {
      try {
        await api.put(`/test-lab/requests/${id}/status`, { status: 'Completed' });
        setApprovedRequests(approvedRequests.filter((req) => req._id !== id));
        toast.success('Test marked as Completed!');
      } catch (error) {
        toast.error('Failed to update status.');
      }
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Droplet className="text-red-600 w-6 h-6" />
          Process Approved Tests
        </h2>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Manage sample collection and mark tests as complete to make them available for billing.
      </p>

      {loading ? (
        <p className="text-gray-600">Loading approved requests...</p>
      ) : approvedRequests.length === 0 ? (
        <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-xl shadow-sm">
          <FlaskConical className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-3 text-lg font-semibold text-gray-900">
            No Approved Requests
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Approve requests from the "Incoming Requests" page first.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {approvedRequests.map((req) => (
            <div
              key={req._id}
              className="bg-gradient-to-r from-white to-red-50 border border-red-100 rounded-xl p-6 shadow hover:shadow-md transition"
            >
              <div className="flex items-center mb-3">
                <User className="w-6 h-6 text-red-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">
                  {req.patient.name}
                </h3>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                <strong className="text-gray-900">Tests:</strong>{' '}
                {req.tests.join(', ')}
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => handleMarkComplete(req._id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow transition"
                >
                  <CheckCircle size={16} /> Mark as Completed
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProcessTests;
