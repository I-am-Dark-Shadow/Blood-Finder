import React, { useState } from "react";
import { X } from "lucide-react";

const ExportReportModal = ({ isOpen, onClose }) => {
  const [format, setFormat] = useState("pdf");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState("");

  const handleDownload = () => {
    const baseUrl = `${
      import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api"
    }/reports/export-patient-records`;
    const token = JSON.parse(localStorage.getItem("auth-storage"))?.state?.token;

    fetch(`${baseUrl}?format=${format}&year=${year}&month=${month}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `records-${year}${month ? "-" + month : ""}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => alert("Could not download file."));

    onClose();
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Export Patient Records
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            >
              {years.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            >
              <option value="">All Months</option>
              {months.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium shadow-sm hover:bg-red-700 transition"
          >
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportReportModal;
