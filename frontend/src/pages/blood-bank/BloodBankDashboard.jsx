import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import {
  Users,
  Clock,
  Heart,
  AlertTriangle,
  Hospital,
} from "lucide-react";

const BloodBankDashboard = () => {
  const [stats, setStats] = useState({
    stockLevels: {},
    totalDonors: 0,
    activeRequests: 0,
    monthDonations: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const LOW_STOCK_THRESHOLD = 10;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/blood-bank/stats");
        setStats(data);
      } catch (error) {
        toast.error("Failed to fetch dashboard stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const lowStockGroups = bloodGroups.filter(
    (group) =>
      (stats.stockLevels[group] || 0) < LOW_STOCK_THRESHOLD &&
      (stats.stockLevels[group] || 0) > 0
  );

  return (
    <div className="animate-fade-in space-y-10">
      {/* Header with Logo */}
      <div className="flex items-center gap-3 mb-4">
        <Hospital className="w-10 h-10 -mt-6 text-red-600" />
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-2">
            Blood Bank Dashboard
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-red-500 to-red-700 rounded-full mt-1"></div>
          <p className="text-gray-600 mt-2">
            Monitor stock levels, donor activities & requests in real-time.
          </p>
        </div>
      </div>

      {/* Blood Stock Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {bloodGroups.map((group) => {
          const units = stats.stockLevels[group] || 0;
          const isLow = units < LOW_STOCK_THRESHOLD;
          const widthPercentage = Math.min((units / 50) * 100, 100);

          return (
            <div
              key={group}
              onClick={() => navigate("/blood-bank/stock")}
              className={`cursor-pointer backdrop-blur-sm bg-white/90 border rounded-xl p-4 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all ${
                isLow && units > 0
                  ? "border-red-300 bg-red-50/90"
                  : "border-gray-200"
              }`}
            >
              <div className="text-xl font-bold text-red-600">{group}</div>
              <div className="text-sm text-gray-500 mb-2">{units} units</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${
                    isLow ? "bg-red-500" : "bg-green-500"
                  } h-2 rounded-full`}
                  style={{ width: `${widthPercentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-red-50 to-white rounded-xl border p-6 flex justify-between items-center shadow hover:shadow-lg transition">
          <div>
            <h3 className="font-semibold text-gray-600">Total Local Donors</h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalDonors}
            </p>
          </div>
          <div className="bg-red-100 p-3 rounded-lg">
            <Users className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-white rounded-xl border p-6 flex justify-between items-center shadow hover:shadow-lg transition">
          <div>
            <h3 className="font-semibold text-gray-600">Active Requests</h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.activeRequests}
            </p>
          </div>
          <div className="bg-orange-100 p-3 rounded-lg">
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl border p-6 flex justify-between items-center shadow hover:shadow-lg transition">
          <div>
            <h3 className="font-semibold text-gray-600">Donations This Month</h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.monthDonations} units
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <Heart className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockGroups.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <AlertTriangle className="w-10 h-10 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">
                Low Stock Alert
              </h3>
              <p className="text-red-700 mt-1">
                The following blood types are running low:{" "}
                <strong>{lowStockGroups.join(", ")}</strong>
              </p>
              {/* <button className="mt-3 bg-red-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-red-700 transition">
                Send Donor Alerts
              </button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodBankDashboard;
