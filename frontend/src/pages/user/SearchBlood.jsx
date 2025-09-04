import React, { useState } from 'react';
import { Search, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const SearchBlood = () => {
  const [filters, setFilters] = useState({ bloodGroup: '', city: '', zipcode: '' });
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState(null); // 'donors' or 'banks'
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async (type, page = 1) => {
    setLoading(true);
    setSearchType(type);
    setResults([]); // Clear previous results

    const endpoint = type === 'donors' ? '/search/donors' : '/search/blood-banks';

    try {
      const { data } = await api.get(endpoint, {
        params: { ...filters, page }
      });

      const searchResults = type === 'donors' ? data.donors : data.banks;
      setResults(searchResults);
      setPagination({ currentPage: data.currentPage, totalPages: data.totalPages });

      if (searchResults.length === 0) {
        toast.success("No results found in your area.");
      }

    } catch (error) {
      toast.error("An error occurred during search.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      handleSearch(searchType, newPage);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Search Filters</h3>
        <form className="space-y-6">
          <div className="grid md:grid-cols-3 gap-5">
            {/* Blood Group */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group
              </label>
              <select
                name="bloodGroup"
                value={filters.bloodGroup}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              >
                <option value="">All Blood Types</option>
                <option>A+</option><option>A-</option>
                <option>B+</option><option>B-</option>
                <option>AB+</option><option>AB-</option>
                <option>O+</option><option>O-</option>
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="Enter city"
                className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>

            {/* Zipcode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zipcode
              </label>
              <input
                type="text"
                name="zipcode"
                value={filters.zipcode}
                onChange={handleFilterChange}
                placeholder="Enter zipcode"
                className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-4 pt-2">
            <button
              type="button"
              onClick={() => handleSearch("banks")}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium shadow-sm hover:bg-red-700 transition"
            >
              <Search size={16} /> Search Blood Banks
            </button>
            <button
              type="button"
              onClick={() => handleSearch("donors")}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium shadow-sm hover:bg-gray-100 transition"
            >
              <Users size={16} /> Search Donors
            </button>
          </div>
        </form>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">
          {searchType === 'donors' ? 'Available Donors' : searchType === 'banks' ? 'Available Blood Banks' : 'Search Results'}
        </h3>
        {loading ? <p>Loading...</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  {searchType === 'donors' && (
                    <>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Blood Group</th>
                      <th className="px-4 py-3 text-left">Location</th>
                      <th className="px-4 py-3 text-left">Contact</th>
                    </>
                  )}
                  {searchType === 'banks' && (
                    <>
                      <th className="px-4 py-3 text-left">Bank Name</th>
                      <th className="px-4 py-3 text-left">Stock</th>
                      <th className="px-4 py-3 text-left">Location</th>
                      <th className="px-4 py-3 text-left">Contact</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {results.map(item =>
                  searchType === 'donors' ? (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700">
                          {item.bloodGroup}
                        </span>
                      </td>
                      <td className="px-4 py-3">{item.city}, {item.zipcode}</td>
                      <td className="px-4 py-3">{item.phone || item.email}</td>
                    </tr>
                  ) : (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">
                          {item.stock.quantity} units ({item.stock.bloodGroup})
                        </span>
                      </td>
                      <td className="px-4 py-3">{item.city}, {item.zipcode}</td>
                      <td className="px-4 py-3">{item.phone}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

        )}
        {/* Pagination */}
        {results.length > 0 && pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="btn-secondary">Previous</button>
              <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="btn-secondary">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBlood;