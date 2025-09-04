import React, { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore.js';
import { Droplets, Building2, TriangleAlert, OctagonAlert, Search, Heart, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

// Stock Status Badge
const StockStatus = ({ stock }) => {
    let status = { text: 'Available', color: 'text-green-600', bg: 'bg-green-100' };
    if (stock < 5) {
        status = { text: 'Urgent Need', color: 'text-red-600', bg: 'bg-red-100' };
    } else if (stock < 10) {
        status = { text: 'Low Stock', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    }
    return (
        <span className={`text-xs px-2 py-1 rounded font-medium ${status.color} ${status.bg}`}>
            {status.text}
        </span>
    );
};

const UserDashboard = () => {
    const { user } = useAuthStore();
    const [dashboardData, setDashboardData] = useState({ nearbyBanks: [], urgentRequest: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await api.get('/dashboard/user');
                setDashboardData(data);
            } catch (error) {
                toast.error("Could not load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.name?.split(' ')[0]}!
                </h2>
                <p className="text-gray-600">Here's what's happening with blood donations today.</p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                
                {/* My Blood Group */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <div className="bg-red-100 rounded-lg p-3">
                                <Droplets className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">My Blood Group</h3>
                                <p className="text-sm text-gray-500">Universal Donor</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-red-600">
                            {user?.bloodGroup || 'N/A'}
                        </span>
                        <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            Active Donor
                        </span>
                    </div>
                </div>

                {/* Nearby Blood Banks */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center">
                            <div className="bg-blue-100 rounded-lg p-3">
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Nearby Blood Banks</h3>
                                <p className="text-sm text-gray-500">With your blood type</p>
                            </div>
                        </div>
                    </div>
                    {loading ? (
                        <p className="text-sm text-gray-500">Loading...</p>
                    ) : (
                        <div className="space-y-2">
                            {dashboardData.nearbyBanks.length > 0 ? (
                                dashboardData.nearbyBanks.map((bank, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <span className="text-sm font-medium">{bank.name}</span>
                                        <StockStatus stock={bank.stock} />
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No banks found with your blood type nearby.</p>
                            )}
                            <Link 
                                to="/user/search" 
                                className="w-full text-center text-sm text-red-600 hover:text-red-700 font-medium mt-2 block"
                            >
                                View All →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Urgent Requests */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <div className="bg-red-100 rounded-lg p-3">
                                <TriangleAlert className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Urgent Requests</h3>
                                <p className="text-sm text-gray-500">In your area</p>
                            </div>
                        </div>
                    </div>
                    {loading ? (
                        <p className="text-sm text-gray-500">Loading...</p>
                    ) : (
                        <div className="space-y-2">
                            {dashboardData.urgentRequest ? (
                                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                                    <span className="text-sm font-medium text-red-900">
                                        {dashboardData.urgentRequest.bloodGroup} Blood Needed
                                    </span>
                                    <span className="text-xs text-red-600">
                                        {dashboardData.urgentRequest.unitsRequired} units
                                    </span>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No urgent requests in your area currently.</p>
                            )}
                            <Link 
                                to="/user/emergency" 
                                className="w-full text-center text-sm text-red-600 hover:text-red-700 font-medium mt-2 block"
                            >
                                View All Requests →
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/user/search" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200">
                        <Search className="w-8 h-8 mb-2" /><span className="text-sm font-medium">Find Blood</span>
                    </Link>
                    <Link to="/user/donate" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200">
                        <Heart className="w-8 h-8 mb-2" /><span className="text-sm font-medium">Donate</span>
                    </Link>
                    <Link to="/user/emergency" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200">
                        <OctagonAlert className="w-8 h-8 mb-2" /><span className="text-sm font-medium">Emergency</span>
                    </Link>
                    <Link to="/user/profile" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200">
                        <User className="w-8 h-8 mb-2" /><span className="text-sm font-medium">Profile</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
