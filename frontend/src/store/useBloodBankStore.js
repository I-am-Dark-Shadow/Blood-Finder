import { create } from 'zustand';
import api from '../api/axios';

const useBloodBankStore = create((set) => ({
    activeRequestCount: 0,
    unreadNotificationCount: 0,

    fetchSidebarCounts: async () => {
        try {
            // Step 1: Fetch all data concurrently for efficiency
            const [localRequestsRes, myStockRes, notificationsRes] = await Promise.all([
                api.get('/emergency-requests'), // Get all requests in the area
                api.get('/blood-bank/my-stock'), // Get this bank's own stock
                api.get('/notifications')
            ]);

            const allLocalRequests = localRequestsRes.data;
            const myStock = myStockRes.data; // This will be an object like { "A+": 32, "O-": 2 }

            // --- THIS IS THE FIX ---
            // Step 2: Filter the requests based on the bank's stock
            const filteredRequests = allLocalRequests.filter(request => {
                const requiredGroup = request.bloodGroup;
                const requiredUnits = request.unitsRequired;
                const availableStock = myStock[requiredGroup] || 0;
                
                return availableStock >= requiredUnits;
            });
            // ------------------------

            // Step 3: Set the state with the CORRECT counts
            set({
                activeRequestCount: filteredRequests.length, // Use the count of filtered requests
                unreadNotificationCount: notificationsRes.data.unreadCount
            });

        } catch (error) {
            console.error("Failed to fetch sidebar counts:", error);
        }
    },
}));

export default useBloodBankStore;