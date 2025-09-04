import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { User, Mail, Phone, MapPin, Droplet } from "lucide-react";

const DonorRecords = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const fetchDonors = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/blood-bank/donors?page=${page}`);
      setDonors(data.donors);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
      });
    } catch (error) {
      toast.error("Failed to fetch donor records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchDonors(newPage);
    }
  };

  return (
    <div className="animate-fade-in bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Local Donor Records</h2>
        <p className="text-sm text-gray-500">
          List of registered donors in your city and zipcode
        </p>
      </div>

      {/* Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-red-50 text-left text-sm font-semibold text-red-700">
              <th className="px-4 py-3">Donor</th>
              <th className="px-4 py-3 text-center">Blood Group</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  Loading donors...
                </td>
              </tr>
            ) : donors.length > 0 ? (
              donors.map((donor) => (
                <tr
                  key={donor._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Donor Info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        src={
                          donor.profilePicture ||
                          `https://ui-avatars.com/api/?name=${donor.name}&background=fee2e2&color=dc2626`
                        }
                        alt={donor.name}
                      />
                      <span className="font-medium text-gray-900">
                        {donor.name}
                      </span>
                    </div>
                  </td>

                  {/* Blood Group */}
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                      <Droplet className="w-3 h-3" />
                      {donor.bloodGroup || "N/A"}
                    </span>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3 text-gray-700">
                    <div className="flex items-center gap-2 hover:text-red-600">
                      <Mail size={14} />
                      <a href={`mailto:${donor.email}`} className="truncate">
                        {donor.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone size={14} />
                      {donor.phone || "N/A"}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3 text-gray-700">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      {donor.city}, {donor.zipcode}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        donor.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {donor.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-8 text-gray-500 italic"
                >
                  No donors found in your area.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {donors.length > 0 && pagination.totalPages > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-3">
          <span className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorRecords;
