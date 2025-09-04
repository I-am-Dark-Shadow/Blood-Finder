import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Trash2, Filter, Droplet } from "lucide-react";

const ManageStock = () => {
  const [allStock, setAllStock] = useState([]);
  const [formData, setFormData] = useState({
    bloodGroup: "",
    quantity: "",
    expiryDate: "",
  });
  const [loading, setLoading] = useState(true);

  const [bloodGroupFilter, setBloodGroupFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState("all");

  const fetchStock = async () => {
    try {
      const { data } = await api.get("/blood-bank/stock");
      setAllStock(data);
    } catch (error) {
      toast.error("Failed to fetch blood stock.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/blood-bank/stock", formData);
      setAllStock([data, ...allStock]);
      toast.success("Stock added successfully!");
      setFormData({ bloodGroup: "", quantity: "", expiryDate: "" });
    } catch (error) {
      toast.error("Failed to add stock.");
    }
  };

  const handleDeleteStock = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await api.delete(`/blood-bank/stock/${id}`);
        setAllStock(allStock.filter((item) => item._id !== id));
        toast.success("Stock entry deleted.");
      } catch (error) {
        toast.error("Failed to delete stock.");
      }
    }
  };

  const filteredStock = allStock.filter((item) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const expiryDate = new Date(item.expiryDate).setHours(0, 0, 0, 0);

    const isExpired = expiryDate < today;
    const groupMatch =
      bloodGroupFilter === "all" || item.bloodGroup === bloodGroupFilter;

    let expiryMatch = true;
    if (expiryFilter === "expired") expiryMatch = isExpired;
    if (expiryFilter === "not-expired") expiryMatch = !isExpired;

    return groupMatch && expiryMatch;
  });

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-10">
      {/* Add New Stock Form */}
      <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-lg border border-red-100 p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Droplet className="text-red-600" /> Add New Stock
        </h3>
        <form
          onSubmit={handleAddStock}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {/* Blood Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Group
            </label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleInputChange}
              required
              className="w-full h-[45px] px-4 py-2 text-sm rounded-xl border border-gray-300 shadow-sm 
                         focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition 
                         cursor-pointer hover:border-red-400"
            >
              <option value="">Select</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity (Units)
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              required
              min="1"
              placeholder="e.g., 10"
              className="w-full h-[45px] px-4 py-2 text-sm rounded-xl border border-gray-300 shadow-sm 
                         focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              required
              className="w-full h-[45px] px-4 py-2 text-sm rounded-xl border border-gray-300 shadow-sm 
                         focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
            />
          </div>

          {/* Add Button */}
          <button
            type="submit"
            className="h-[45px] mt-6 flex items-center justify-center rounded-xl bg-red-600 text-white 
                       font-medium shadow hover:bg-red-700 transition"
          >
            + Add Stock
          </button>
        </form>
      </div>

      {/* Stock Inventory */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Current Stock Inventory
          </h3>
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-gray-500" />
            {/* Blood Group Filter */}
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="h-[40px] px-3 py-1 text-sm rounded-xl border border-gray-300 shadow-sm 
                         focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition cursor-pointer"
            >
              <option value="all">All Blood Groups</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            {/* Expiry Filter */}
            <select
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value)}
              className="h-[40px] px-3 py-1 text-sm rounded-xl border border-gray-300 shadow-sm 
                         focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="not-expired">Not Expired</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-red-50 text-red-900 text-left">
                <th className="px-4 py-3 font-semibold">Blood Group</th>
                <th className="px-4 py-3 font-semibold">Quantity</th>
                <th className="px-4 py-3 font-semibold">Received</th>
                <th className="px-4 py-3 font-semibold">Expiry</th>
                <th className="px-4 py-3 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    Loading stock...
                  </td>
                </tr>
              ) : filteredStock.length > 0 ? (
                filteredStock.map((item) => {
                  const isExpired =
                    new Date(item.expiryDate) < new Date().setHours(0, 0, 0, 0);
                  return (
                    <tr
                      key={item._id}
                      className={`transition hover:bg-gray-50 ${
                        isExpired ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        <span className="px-3 py-1 rounded-full text-white bg-red-600 text-xs font-medium shadow">
                          {item.bloodGroup}
                        </span>
                      </td>
                      <td className="px-4 py-3">{item.quantity} units</td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td
                        className={`px-4 py-3 font-medium ${
                          isExpired ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDeleteStock(item._id)}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No stock found for selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageStock;
