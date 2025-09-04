import React, { useState, useEffect } from "react";
import { X, Phone, Hospital } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";

const ContactHospitalModal = ({ isOpen, onClose, request }) => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && request) {
      const fetchBanks = async () => {
        setLoading(true);
        try {
          const { data } = await api.get(`/blood-bank/find`, {
            params: {
              city: request.city,
              bloodGroup: request.bloodGroup,
            },
          });
          setBanks(data);
        } catch (error) {
          toast.error("Could not fetch nearby blood banks.");
        } finally {
          setLoading(false);
        }
      };
      fetchBanks();
    }
  }, [isOpen, request]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Hospital className="text-red-600" size={20} />
            Nearby Hospitals with{" "}
            <span className="text-red-600">{request?.bloodGroup}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[65vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <p className="text-center py-6 text-gray-500">
              Searching for nearby blood banks...
            </p>
          ) : banks.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-red-50 text-red-900">
                    <th className="px-4 py-3 text-left font-semibold">
                      Hospital / Blood Bank
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Available Stock
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Contact
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {banks.map((bank) => (
                    <tr
                      key={bank._id}
                      className="hover:bg-gray-50 transition text-gray-700"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {bank.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {bank.address}, {bank.city}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-green-600">
                        {bank.stock} units
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`tel:${bank.phone}`}
                          className="flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          <Phone size={16} /> {bank.phone || "Not Available"}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-6 text-gray-500">
              No blood banks found in{" "}
              <span className="font-semibold">{request?.city}</span> with{" "}
              <span className="text-red-600 font-semibold">
                {request?.bloodGroup}
              </span>{" "}
              stock.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactHospitalModal;
