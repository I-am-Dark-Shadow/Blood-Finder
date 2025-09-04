import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports = () => {
  const [donationsChartData, setDonationsChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [stockChartData, setStockChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ year: new Date().getFullYear() });

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/reports/blood-bank", {
          params: filters,
        });

        // Donations Data → Bar Chart
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const donationValues = Array(12).fill(0);
        data.donationsData.forEach((item) => {
          donationValues[item._id.month - 1] = item.totalDonations;
        });
        setDonationsChartData({
          labels: monthNames,
          datasets: [
            {
              label: `Total Donations in ${filters.year}`,
              data: donationValues,
              backgroundColor: "rgba(220, 38, 38, 0.7)",
              borderColor: "rgba(220, 38, 38, 1)",
              borderWidth: 2,
              borderRadius: 6,
            },
          ],
        });

        // Stock Data → Doughnut Chart
        const stockLabels = data.stockData.map((item) => item._id);
        const stockValues = data.stockData.map((item) => item.totalUnits);
        setStockChartData({
          labels: stockLabels,
          datasets: [
            {
              label: "Units",
              data: stockValues,
              backgroundColor: [
                "#ef4444",
                "#f97316",
                "#eab308",
                "#22c55e",
                "#14b8a6",
                "#06b6d4",
                "#3b82f6",
                "#8b5cf6",
              ],
              borderColor: "#fff",
              borderWidth: 2,
            },
          ],
        });
      } catch (error) {
        toast.error("Failed to fetch report data.");
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <div className="animate-fade-in space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>

      {/* Donations per Month Chart */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
          <h3 className="text-xl font-bold text-red-700">
            Donations Analysis
          </h3>
          <div>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
            >
              {years.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="h-80 w-full">
          {loading ? (
            <p className="text-gray-500 italic">Loading chart...</p>
          ) : (
            <Bar
              data={donationsChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    labels: { color: "#374151" },
                  },
                  tooltip: {
                    backgroundColor: "#dc2626",
                    titleColor: "#fff",
                    bodyColor: "#fff",
                  },
                },
                scales: {
                  x: {
                    ticks: { color: "#374151" },
                    grid: { color: "#f3f4f6" },
                  },
                  y: {
                    beginAtZero: true,
                    ticks: { color: "#374151" },
                    grid: { color: "#f3f4f6" },
                  },
                },
              }}
            />
          )}
        </div>
      </div>

      {/* Blood Group Distribution Chart */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-red-700 mb-4">
          Current Stock Distribution
        </h3>
        <div className="h-80 w-full flex justify-center items-center">
          {loading ? (
            <p className="text-gray-500 italic">Loading chart...</p>
          ) : stockChartData.labels.length > 0 ? (
            <Doughnut
              data={stockChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "right",
                    labels: {
                      color: "#374151",
                      boxWidth: 20,
                      padding: 16,
                    },
                  },
                  tooltip: {
                    backgroundColor: "#dc2626",
                    titleColor: "#fff",
                    bodyColor: "#fff",
                  },
                },
              }}
            />
          ) : (
            <p className="text-gray-500 italic">
              No stock data available to display.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
