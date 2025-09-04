import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Search, Droplet, MapPin, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import useAuthStore from '../store/authStore';

const PublicSearch = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

    // This state holds the current values of the input fields
    const [filters, setFilters] = useState(() => {
        const params = new URLSearchParams(location.search);
        return {
            bloodGroup: params.get('bloodGroup') || location.state?.bloodGroup || '',
            location: params.get('location') || location.state?.location || '',
        };
    });

    // This function fetches data based on the provided filters and page
    const fetchDonors = useCallback(async (currentFilters, page = 1) => {
        // Only search if there is a location or blood group
        if (!currentFilters.location && !currentFilters.bloodGroup) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.get('/search/public/donors', {
                params: { ...currentFilters, page }
            });
            setResults(data.donors);
            setPagination({ currentPage: data.currentPage, totalPages: data.totalPages });

            // Update URL to reflect the search, making it shareable
            const params = new URLSearchParams({ ...currentFilters, page });
            navigate(`?${params.toString()}`, { replace: true, state: currentFilters });

        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    }, [navigate]); // navigate is a stable dependency

    // This useEffect runs only ONCE when the component loads to perform the initial search
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = params.get('page') || 1;

        // Use the initial filters to perform the first search
        fetchDonors(filters, Number(page));
    }, []); // <-- Empty array ensures this runs only on mount

    // Handler for form submission
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchDonors(filters, 1); // Always search from page 1 on a new search
    };

    // Handler for pagination
    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            fetchDonors(filters, newPage);
        }
    };

    // Handler for input field changes
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="font-inter bg-gray-50 min-h-screen">
            <header className="bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Link to="/" className="inline-flex items-center gap-2 group">
                            <div className="h-8 w-8 rounded-md bg-rose-600 text-white grid place-items-center shadow-sm">BF</div>
                            <span className="text-slate-800 text-base font-medium">Blood Finder</span>
                        </Link>
                        {isAuthenticated ? (
                            <Link to="/login" className="inline-flex items-center gap-2 rounded-md bg-rose-600 text-white px-3.5 py-2 font-medium hover:bg-rose-700 transition shadow-sm">
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <Link to="/login" className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-slate-700 hover:text-rose-700 hover:border-rose-200 hover:bg-rose-50 transition shadow-sm">
                                <span className="font-medium">Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Form */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6">
                    <form onSubmit={handleSearchSubmit} className="grid sm:grid-cols-3 gap-3">
                        <select
                            name="bloodGroup"
                            value={filters.bloodGroup}
                            onChange={handleFilterChange}
                            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                        >
                            <option value="">Any Blood Group</option>
                            <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                            <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                        </select>
                        <input
                            name="location"
                            type="text"
                            value={filters.location}
                            onChange={handleFilterChange}
                            placeholder="City or Zipcode"
                            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                        />
                        <button type="submit" disabled={loading} className="group w-full inline-flex items-center justify-center gap-2 rounded-md bg-rose-600 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-rose-700 transition disabled:bg-rose-400">
                            <Search className="h-4 w-4" />
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                </div>

                {/* Results Table - Mobile Responsive */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="divide-y divide-slate-200">
                        {loading ? (
                            <p className="p-6 text-center text-slate-500">Loading donor data...</p>
                        ) : results.length === 0 ? (
                            <p className="p-6 text-center text-slate-500">No active donors found. Please broaden your search criteria.</p>
                        ) : (
                            results.map(donor => (
                                <div key={donor._id} className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 items-center hover:bg-rose-50/50 transition">
                                    <div className="col-span-2 md:col-span-1">
                                        <p className="font-medium text-slate-800">{donor.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Droplet className="w-4 h-4 text-rose-500" />
                                        <span>{donor.bloodGroup}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span>{donor.city}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-rose-600 font-medium">
                                        <Phone className="w-4 h-4" />
                                        <span>{donor.phone || 'N/A'}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                        <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                            <ChevronLeft className="h-4 w-4" /> Previous
                        </button>
                        <span className="text-sm text-slate-600">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                        <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                            Next <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PublicSearch;