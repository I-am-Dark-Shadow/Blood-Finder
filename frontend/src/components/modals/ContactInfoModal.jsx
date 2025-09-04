import React from "react";
import { X, User, Phone, Mail, MapPin } from "lucide-react";

const ContactInfoModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
            <User className="w-5 h-5" /> Requester Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
            <Phone className="text-red-600 w-5 h-5" />
            <p className="text-sm text-gray-700">
              <span className="font-medium">Contact:</span>{" "}
              {user.phone || "Not provided"}
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
            <Mail className="text-red-600 w-5 h-5" />
            <p className="text-sm text-gray-700">
              <span className="font-medium">Email:</span> {user.email || "N/A"}
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
            <MapPin className="text-red-600 w-5 h-5" />
            <p className="text-sm text-gray-700">
              <span className="font-medium">Address:</span>{" "}
              {user.address || "N/A"}, {user.city || "N/A"},{" "}
              {user.zipcode || "N/A"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoModal;
