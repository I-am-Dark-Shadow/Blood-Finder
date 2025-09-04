import React, { useState, useEffect, useRef } from 'react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Info, Calendar, Clock, Check, XCircle, Trash2 } from 'lucide-react';

const ScheduleStatusBadge = ({ status }) => {
    const statusStyles = {
        Pending: { icon: <Clock size={14} />, text: 'text-yellow-800', bg: 'bg-yellow-100' },
        Approved: { icon: <Check size={14} />, text: 'text-green-800', bg: 'bg-green-100' },
        Expired: { icon: <XCircle size={14} />, text: 'text-gray-800', bg: 'bg-gray-200' },
        Rejected: { icon: <XCircle size={14} />, text: 'text-red-800', bg: 'bg-red-100' },
        Completed: { icon: <Check size={14} />, text: 'text-blue-800', bg: 'bg-blue-100' },
    };
    const currentStatus = statusStyles[status] || statusStyles.Pending;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${currentStatus.bg} ${currentStatus.text}`}>
            {currentStatus.icon} {status}
        </span>
    );
};

const DonateBlood = () => {
    const { user } = useAuthStore();
    const dateInputRef = useRef(null);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        preferredDate: '',
        address: user?.address || '',
        city: user?.city || '',
        zipcode: user?.zipcode || '',
        contactNumber: user?.phone || '',
    });

    const fetchSchedules = async () => {
        try {
            const { data } = await api.get('/donation-schedules/my-schedules');
            setSchedules(data);
        } catch (error) {
            toast.error("Could not fetch donation history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Set min date for the date input
        const today = new Date();
        const minDate = today.toISOString().split('T')[0];
        if (dateInputRef.current) {
            dateInputRef.current.setAttribute('min', minDate);
        }
        // Fetch user's previous schedules
        fetchSchedules();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user.bloodGroup) {
            toast.error("Please set your blood group in your profile first.");
            return;
        }
        try {
            const { data } = await api.post('/donation-schedules', formData);
            toast.success(data.message);
            setSchedules([data.schedule, ...schedules]); // Add new schedule to the top of the list
            setFormData({ ...formData, preferredDate: '' }); // Clear date for next schedule
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to schedule donation.");
        }
    };

    const handleCancel = async (id) => {
        if (window.confirm("Are you sure you want to cancel this pending donation schedule?")) {
            try {
                await api.delete(`/donation-schedules/${id}`);
                toast.success("Schedule canceled.");
                fetchSchedules(); // Refetch the list
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to cancel schedule.");
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
            {/* --- Scheduling Form --- */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Schedule a Blood Donation
                    </h2>
                    <p className="text-gray-600">
                        Let blood banks in your area know you're available to donate.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-5">
                        {/* Blood Group */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Blood Group (from profile)
                            </label>
                            <input
                                type="text"
                                value={user?.bloodGroup || "Not Set"}
                                className="w-full px-3 py-2 rounded-lg border bg-gray-100 text-gray-700 shadow-sm cursor-not-allowed"
                                readOnly
                            />
                        </div>

                        {/* Preferred Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Preferred Date of Availability
                            </label>
                            <input
                                type="date"
                                name="preferredDate"
                                value={formData.preferredDate}
                                onChange={handleChange}
                                ref={dateInputRef}
                                className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter your full address"
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                            required
                        />
                    </div>

                    {/* City - Zipcode - Contact */}
                    <div className="grid md:grid-cols-3 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Enter city"
                                className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Zipcode
                            </label>
                            <input
                                type="text"
                                name="zipcode"
                                value={formData.zipcode}
                                onChange={handleChange}
                                placeholder="Enter zipcode"
                                className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Number
                            </label>
                            <input
                                type="tel"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-3">
                        <button
                            type="submit"
                            className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium shadow-sm hover:bg-red-700 transition"
                        >
                            Submit Schedule
                        </button>
                    </div>
                </form>
            </div>

            {/* --- Schedule History --- */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Donation Schedule History</h3>
                <div className="space-y-4">
                    {loading && <p>Loading history...</p>}
                    {!loading && schedules.length === 0 && <p className="text-gray-500">You have no scheduled donations.</p>}
                    {!loading && schedules.map(schedule => (
                        <div key={schedule._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <div className="bg-red-100 rounded-full p-2 mr-4"><Calendar className="w-5 h-5 text-red-600" /></div>
                                <div>
                                    <p className="font-medium">Available on: {new Date(schedule.preferredDate).toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-500">{schedule.address}, {schedule.city}</p>
                                    {schedule.status === 'Approved' && schedule.visitDate && (
                                        <p className="text-sm text-green-600 font-semibold">Blood bank visit scheduled for: {new Date(schedule.visitDate).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <ScheduleStatusBadge status={schedule.status} />
                                {schedule.status === 'Pending' && (
                                    <button onClick={() => handleCancel(schedule._id)} className="text-red-500 hover:text-red-700">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DonateBlood;