import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Clock, CheckCircle, IndianRupee } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TestLabDashboard = () => {
  const [stats, setStats] = useState({ pendingRequests: 0, completedToday: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    groupBy: 'month',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/dashboard/test-lab', { params: filters });
        setStats(data.stats);

        // Process chart data
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let labels = [];
        let incomeValues = [];

        if (filters.groupBy === 'month') {
          labels = monthNames;
          incomeValues = Array(12).fill(0);
          data.chartData.forEach(item => {
            incomeValues[item._id.month - 1] = item.totalIncome;
          });
        } else {
          const daysInMonth = new Date(filters.year, filters.month, 0).getDate();
          labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
          incomeValues = Array(daysInMonth).fill(0);
          data.chartData.forEach(item => {
            incomeValues[item._id.day - 1] = item.totalIncome;
          });
        }

        setChartData({
          labels,
          datasets: [
            {
              label: `Income (₹) - ${filters.year}`,
              data: incomeValues,
              borderColor: '#be123c',
              backgroundColor: 'rgba(190, 18, 60, 0.1)',
              fill: true,
              tension: 0.3,
            },
          ],
        });
      } catch (error) {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* --- Stat Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Pending Requests</h3>
            <Clock className="text-orange-500" />
          </div>
          <p className="text-3xl font-bold mt-2">{stats.pendingRequests}</p>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Tests Completed Today</h3>
            <CheckCircle className="text-green-500" />
          </div>
          <p className="text-3xl font-bold mt-2">{stats.completedToday}</p>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Revenue This Month</h3>
            <IndianRupee className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold mt-2">₹{stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* --- Chart --- */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <h3 className="text-xl font-bold text-gray-900">Income Analytics</h3>
          <div className="flex flex-wrap gap-2">
            <select
              name="groupBy"
              value={filters.groupBy}
              onChange={handleFilterChange}
              className="input-field-sm bg-red-50 border-red-200 text-red-700 rounded-lg p-2 font-semibold"
            >
              <option value="month">Month-wise</option>
              <option value="day">Day-wise</option>
            </select>

            {filters.groupBy === 'day' && (
              <select
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                className="input-field-sm bg-red-50 border-red-200 text-red-700 rounded-lg p-2 font-semibold"
              >
                {months.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            )}

            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="input-field-sm bg-red-50 border-red-200 text-red-700 rounded-lg p-2 font-semibold"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-80">
          {loading ? (
            <p>Loading chart...</p>
          ) : (
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true, // No negative values
                    ticks: {
                      callback: (value) => `₹${value}`, // Show in ₹
                    },
                  },
                  x: {
                    ticks: { color: '#374151' },
                  },
                },
                plugins: {
                  legend: {
                    labels: { color: '#374151' },
                  },
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TestLabDashboard;
