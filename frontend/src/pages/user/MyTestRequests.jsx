import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Microscope, Calendar, FileText, Download } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const styles = {
        Pending: "bg-yellow-100 text-yellow-800",
        Approved: "bg-blue-100 text-blue-800",
        Completed: "bg-green-100 text-green-800",
        Rejected: "bg-red-100 text-red-800",
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>;
};

const MyTestRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

    const fetchRequests = async (page = 1) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/test-requests/my-requests?page=${page}`);
            setRequests(data.requests);
            setPagination({ currentPage: data.currentPage, totalPages: data.totalPages });
        } catch (error) {
            toast.error("Failed to fetch test request history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests(1);
    }, []);

    const handleDownload = async (type, requestId, fileName) => {
        if (!requestId) {
            toast.error("File not available for download.");
            return;
        }

        toast.loading('Downloading...', { id: 'download-toast' });

        try {
            const url = type === 'bill'
                ? `/billing/download-bill/${requestId}`
                : `/reports/download-report/${requestId}`;

            const response = await api.get(url, { responseType: 'blob' });

            const fileURL = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = fileURL;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(fileURL);
            document.body.removeChild(a);

            toast.success('Download complete!', { id: 'download-toast' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Download failed.', { id: 'download-toast' });
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            fetchRequests(newPage);
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Test Request History</h2>
            <div className="bg-white rounded-lg border p-6">
                <div className="space-y-4">
                    {loading ? <p>Loading history...</p> :
                        requests.length > 0 ? requests.map(req => (
                            <div key={req._id} className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex flex-wrap justify-between items-start gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Microscope size={18} className="text-gray-600" />
                                            <h3 className="font-semibold text-lg text-gray-800">{req.testLab.name}</h3>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold">Tests:</span> {req.testsWithPrices.length > 0 ? req.testsWithPrices.map(t => t.name).join(', ') : req.tests.join(', ')}
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            <Calendar size={12} /> Requested on {new Date(req.createdAt).toLocaleDateString()}
                                        </p>
                                        {req.totalPrice > 0 &&
                                            <p className="text-sm font-bold mt-2">Total: ₹{req.totalPrice.toFixed(2)}</p>
                                        }
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                        <StatusBadge status={req.status} />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDownload('report', req._id, `Test-Report-${req._id}.pdf`)}
                                                disabled={!req.report}
                                                className="btn-secondary-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                                <Download size={14} /> Report
                                            </button>

                                            <button
                                                onClick={() => handleDownload('bill', req._id, `Bill-${req._id}.pdf`)}
                                                disabled={!req.bill}
                                                className="btn-primary-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                                <FileText size={14} /> Bill
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="text-center py-6 text-gray-500">You have not made any test requests yet.</p>}
                </div>
                {requests.length > 0 && pagination.totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                        <span className="text-sm text-gray-600">Page {pagination.currentPage} of {pagination.totalPages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="btn-secondary-sm">Previous</button>
                            <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="btn-secondary-sm">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTestRequests;