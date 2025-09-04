import React, { useState, useEffect } from "react";
import { AlertTriangle, Clock, CheckCircle, PhoneCall } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import ContactInfoModal from "../../components/modals/ContactInfoModal";

const BloodBankRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data } = await api.get("/emergency-requests");
        setRequests(data);
      } catch (error) {
        toast.error("Failed to fetch blood requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleOpenContactModal = (user) => {
    setSelectedUser(user);
    setContactModalOpen(true);
  };

  const handleFulfillRequest = async (requestId) => {
    if (
      window.confirm(
        "Are you sure you want to fulfill this request? This will notify other banks."
      )
    ) {
      try {
        await api.put(`/emergency-requests/${requestId}/fulfill`);
        setRequests(requests.filter((req) => req._id !== requestId));
        toast.success("Request successfully marked as fulfilled!");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fulfill request.");
      }
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <ContactInfoModal
        isOpen={isContactModalOpen}
        onClose={() => setContactModalOpen(false)}
        user={selectedUser}
      />

      {/* Header */}
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-bold text-gray-900">
          🚨 Emergency Blood Requests
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Active requests in your city and nearby areas
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500 italic">Loading requests...</p>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-white border border-dashed rounded-xl">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
          <h3 className="mt-3 text-lg font-semibold text-gray-800">
            No Active Requests
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Currently there are no emergency requests in your area.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-6"
            >
              {/* Top section */}
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                    {req.bloodGroup} Blood Needed
                  </h3>
                  <p className="text-gray-700 mt-1">
                    <span className="font-medium">{req.hospitalName}</span> —{" "}
                    {req.unitsRequired} units required
                  </p>
                  <p className="text-sm text-gray-600">
                    Patient:{" "}
                    <span className="font-medium">{req.patientName}</span>
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Clock size={14} /> Requested by {req.createdBy.name}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleOpenContactModal(req.createdBy)}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 transition"
                  >
                    <PhoneCall size={16} /> Contact
                  </button>
                  <button
                    onClick={() => handleFulfillRequest(req._id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium shadow-sm hover:bg-red-700 transition"
                  >
                    <CheckCircle size={16} /> Mark as Complete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BloodBankRequests;
