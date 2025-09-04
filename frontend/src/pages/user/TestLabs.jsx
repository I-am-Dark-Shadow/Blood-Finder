import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import TestRequestModal from '../../components/modals/TestRequestModal';

const TestLabs = () => {
  const user = useAuthStore((state) => state.user);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);

  useEffect(() => {
    const fetchLabs = async () => {
      if (!user) return;

      if (!user.city && !user.zipcode) {
        toast.error("Please set your city/zipcode in your profile to find labs.", { id: 'location-error' });
        setLoading(false);
        setLabs([]);
        return;
      }

      try {
        setLoading(true);
        const { data } = await api.get('/search/test-labs', {
          params: { city: user.city, zipcode: user.zipcode }
        });
        setLabs(data.labs);
      } catch (error) {
        toast.error("Failed to fetch nearby test labs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLabs();
  }, [user]);

  const handleOpenModal = (lab) => {
    setSelectedLab(lab);
    setModalOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <TestRequestModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        testLab={selectedLab}
      />

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nearby Test Labs</h2>

      <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-lg border border-red-100 p-4 sm:p-6">
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-red-100 text-red-800">
                <th className="px-4 py-3 font-semibold">Lab Name</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">Loading labs...</td>
                </tr>
              ) : labs.length > 0 ? (
                labs.map((lab) => (
                  <tr key={lab._id} className="hover:bg-red-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">{lab.name}</td>
                    <td className="px-4 py-3 text-gray-700">{lab.city}, {lab.zipcode}</td>
                    <td className="px-4 py-3 text-gray-700">{lab.phone || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleOpenModal(lab)}
                        className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-sm"
                      >
                        Request Test
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No test labs found in your area.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="grid md:hidden gap-4">
          {loading ? (
            <p className="text-center text-gray-500">Loading labs...</p>
          ) : labs.length > 0 ? (
            labs.map((lab) => (
              <div
                key={lab._id}
                className="bg-white border border-red-100 rounded-xl shadow-sm p-4"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{lab.name}</h3>
                <p className="text-sm text-gray-600"><span className="font-medium">Location:</span> {lab.city}, {lab.zipcode}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Contact:</span> {lab.phone || 'N/A'}</p>
                <div className="mt-3">
                  <button
                    onClick={() => handleOpenModal(lab)}
                    className="w-full px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-sm"
                  >
                    Request Test
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No test labs found in your area.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestLabs;
