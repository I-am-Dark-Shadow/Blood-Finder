import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import EmergencyRequestModal from '../../components/modals/EmergencyRequestModal';
import ContactHospitalModal from '../../components/modals/ContactHospitalModal'; // Import the new modal

const RequestCard = ({ request, onEdit, onDelete, onContact }) => {
    const { user } = useAuthStore();
    const isOwner = user?._id === request.createdBy._id;

    const urgencyDetails = {
        Critical: { icon: <AlertCircle className="text-red-600" />, border: "border-red-300", bg: "bg-red-100", tagBg: "bg-red-100 text-red-600" },
        Urgent: { icon: <Clock className="text-yellow-600" />, border: "border-yellow-300", bg: "bg-yellow-100", tagBg: "bg-yellow-100 text-yellow-600" },
        Normal: { icon: <MapPin className="text-blue-600" />, border: "border-blue-300", bg: "bg-blue-100", tagBg: "bg-blue-100 text-blue-600" },
    };
    const current = urgencyDetails[request.urgency];

    return (
        <div className={`bg-white border ${current.border} rounded-lg p-6 shadow-sm`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start">
                    <div className={`${current.bg} rounded-full p-3 mr-4`}>{current.icon}</div>
                    <div>
                        <div className="flex items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{request.bloodGroup} Blood Needed at {request.hospitalName}</h3>
                            <span className={`ml-3 ${current.tagBg} px-2 py-1 rounded-full text-xs font-medium capitalize`}>{request.urgency}</span>
                        </div>
                        <p className="text-gray-600 mb-2">Patient: {request.patientName} | Units: {request.unitsRequired}</p>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{request.city}, {request.zipcode}</span>
                            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{request.timeNeeded}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col space-y-2 items-end">
                    {/* Updated button to trigger the modal */}
                    <button onClick={() => onContact(request)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">Contact Hospital</button>
                    {isOwner && (
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => onEdit(request)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                            <button onClick={() => onDelete(request._id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const EmergencyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [requestToEdit, setRequestToEdit] = useState(null);
    const [isContactModalOpen, setContactModalOpen] = useState(false);
    const [selectedRequestForContact, setSelectedRequestForContact] = useState(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/emergency-requests');
            setRequests(data);
        } catch (error) {
            toast.error("Could not fetch emergency requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);
    
    const handleOpenModal = (request = null) => {
        setRequestToEdit(request);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setRequestToEdit(null);
        setModalOpen(false);
    };

    // **FIXED**: This function now updates the UI instantly
    const handleSave = (savedRequest) => {
        if (requestToEdit) {
            // If we edited a request, update it in the list
            setRequests(requests.map(req => req._id === savedRequest._id ? savedRequest : req));
        } else {
            // If we created a new request, add it to the top of the list
            setRequests([savedRequest, ...requests]);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this request?")) {
            try {
                await api.delete(`/emergency-requests/${id}`);
                toast.success("Request deleted.");
                setRequests(requests.filter(req => req._id !== id)); // Instantly remove from UI
            } catch (error) {
                toast.error("Failed to delete request.");
            }
        }
    };

    // **NEW**: Handlers for the Contact Hospital modal
    const handleOpenContactModal = (request) => {
        setSelectedRequestForContact(request);
        setContactModalOpen(true);
    };
    
    const handleCloseContactModal = () => {
        setContactModalOpen(false);
        setSelectedRequestForContact(null);
    };

    return (
        <div className="animate-fade-in">
            <EmergencyRequestModal isOpen={isModalOpen} onClose={handleCloseModal} requestToEdit={requestToEdit} onSave={handleSave} />
            <ContactHospitalModal isOpen={isContactModalOpen} onClose={handleCloseContactModal} request={selectedRequestForContact} />
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Emergency Blood Requests</h2>
                    <p className="text-gray-600">Urgent requests from people in your area who need immediate help.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2">
                    <Plus className="w-4 h-4" />Create Request
                </button>
            </div>
            <div className="space-y-4">
                {loading && <p>Loading requests...</p>}
                {!loading && requests.length === 0 && <p className="text-center text-gray-500 py-8">No active emergency requests found in your area.</p>}
                {!loading && requests.map(req => <RequestCard key={req._id} request={req} onEdit={handleOpenModal} onDelete={handleDelete} onContact={handleOpenContactModal} />)}
            </div>
        </div>
    );
};

export default EmergencyRequests;