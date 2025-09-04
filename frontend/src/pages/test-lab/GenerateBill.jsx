import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import { Plus, Trash2, Upload, FileText, Droplet } from "lucide-react";

const GenerateBill = () => {
    const user = useAuthStore((state) => state.user);
    const [patientsForBilling, setPatientsForBilling] = useState([]);
    const [selectedRequestId, setSelectedRequestId] = useState("");
    const [patientName, setPatientName] = useState("");
    const [patientEmail, setPatientEmail] = useState("");
    const [testsWithPrices, setTestsWithPrices] = useState([
        { name: "", price: "" },
    ]);
    const [reportFile, setReportFile] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchPatientsForBilling = async () => {
            if (!user) {
                setPageLoading(false);
                return;
            }
            try {
                const { data } = await api.get("/billing/patients-for-billing");
                setPatientsForBilling(data);
            } catch (error) {
                toast.error("Failed to fetch patients for billing.", {
                    id: "fetch-patients-error",
                });
            } finally {
                setPageLoading(false);
            }
        };

        fetchPatientsForBilling();
    }, [user]);

    useEffect(() => {
        const total = testsWithPrices.reduce(
            (sum, test) => sum + (Number(test.price) || 0),
            0
        );
        setTotalPrice(total);
    }, [testsWithPrices]);

    const handlePatientSelect = (e) => {
        const requestId = e.target.value;
        const selectedRequest = patientsForBilling.find((p) => p._id === requestId);
        if (selectedRequest) {
            setSelectedRequestId(requestId);
            setPatientName(selectedRequest.patient.name);
            setPatientEmail(selectedRequest.patient.email);
            setTestsWithPrices(
                selectedRequest.tests.map((testName) => ({ name: testName, price: "" }))
            );
        } else {
            setSelectedRequestId("");
            setPatientName("");
            setPatientEmail("");
            setTestsWithPrices([{ name: "", price: "" }]);
        }
    };

    const handleTestChange = (index, event) => {
        const values = [...testsWithPrices];
        values[index][event.target.name] = event.target.value;
        setTestsWithPrices(values);
    };

    const handleAddTest = () =>
        setTestsWithPrices([...testsWithPrices, { name: "", price: "" }]);

    const handleRemoveTest = (index) => {
        const values = [...testsWithPrices];
        values.splice(index, 1);
        setTestsWithPrices(values);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRequestId || !reportFile) {
            toast.error("Please select a patient and upload their test report.");
            return;
        }

        const formData = new FormData();
        formData.append("testsWithPrices", JSON.stringify(testsWithPrices));
        formData.append("totalPrice", totalPrice);
        formData.append("report", reportFile);

        setLoading(true);
        try {
            const { data } = await api.post(
                `/billing/generate-bill/${selectedRequestId}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            toast.success(data.message);
            setHistory([data.request, ...history]);
            setPatientsForBilling(
                patientsForBilling.filter((p) => p._id !== selectedRequestId)
            );
            setSelectedRequestId("");
            setPatientName("");
            setPatientEmail("");
            setTestsWithPrices([{ name: "", price: "" }]);
            setReportFile(null);
            e.target.reset();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to generate bill.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-8">
            {/* --- Generate Bill Form --- */}
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl border border-gray-200 shadow-md p-4 md:p-6"
            >
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                    <Droplet className="text-red-600 w-5 h-5 md:w-6 md:h-6" /> Generate
                    Bill & Report
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    Select a patient whose tests are completed to generate their bill.
                </p>

                {pageLoading ? (
                    <p className="text-gray-600">Loading patient list...</p>
                ) : (
                    <div className="space-y-6">
                        {/* Patient Select */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Patient (Test Completed)
                            </label>
                            <select
                                value={selectedRequestId}
                                onChange={handlePatientSelect}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
                                required
                            >
                                <option value="">-- Select a Patient --</option>
                                {patientsForBilling.length > 0 ? (
                                    patientsForBilling.map((req) => (
                                        <option key={req._id} value={req._id}>
                                            {req.patient.name} (Tests: {req.tests.join(", ")})
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>No patients ready for billing</option>
                                )}
                            </select>
                        </div>

                        {selectedRequestId && (
                            <>
                                {/* Patient Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Patient Name
                                        </label>
                                        <input
                                            type="text"
                                            value={patientName}
                                            readOnly
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Patient Email
                                        </label>
                                        <input
                                            type="email"
                                            value={patientEmail}
                                            readOnly
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Tests with Prices */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tests Performed & Prices
                                    </label>
                                    <div className="space-y-2">
                                        {testsWithPrices.map((test, index) => (
                                            <div
                                                key={index}
                                                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                                            >
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={test.name}
                                                    onChange={(e) => handleTestChange(index, e)}
                                                    placeholder="Test Name"
                                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
                                                />
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={test.price}
                                                    onChange={(e) => handleTestChange(index, e)}
                                                    placeholder="Price (₹)"
                                                    className="w-full sm:w-32 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
                                                    min="0"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTest(index)}
                                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex-shrink-0 self-start sm:self-auto"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddTest}
                                        className="mt-3 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-2 w-full sm:w-auto"
                                    >
                                        <Plus size={16} /> Add Another Test
                                    </button>
                                </div>

                                {/* Total Price */}
                                <div className="flex justify-between sm:justify-end items-center text-lg font-bold text-gray-800">
                                    <span className="sm:hidden">Total:</span>
                                    <span className="text-red-600">₹{totalPrice}</span>
                                </div>

                                {/* Upload Report */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Upload Final Test Report (PDF)
                                    </label>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50">
                                        <Upload className="text-red-500" />
                                        <input
                                            type="file"
                                            onChange={(e) => setReportFile(e.target.files[0])}
                                            accept=".pdf"
                                            className="w-full text-sm text-gray-600"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="pt-4 border-t">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full md:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 disabled:bg-red-400"
                                    >
                                        <FileText size={18} />
                                        {loading ? "Generating..." : "Generate Bill & Save Report"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </form>

            {/* --- History Section --- */}
            <div className="bg-white rounded-xl border border-gray-200 shadow p-4 md:p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Generated Bill History
                </h3>
                <p className="text-sm text-gray-500">
                    History of generated bills will appear here.
                </p>
            </div>
        </div>
    );
};

export default GenerateBill;