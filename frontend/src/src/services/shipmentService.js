import API from "./api";

export const shipmentService = {
    createShipment: async (shipmentData) => {
        const response = await API.post('/shipments', shipmentData);
        return response.data;
    },

    getShipmentByTracking: async (trackingNumber) => {
        try {
            const response = await API.get(`/shipments/track/${trackingNumber}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Tracking number not registered in our matrix. Please verify.";
            throw new Error(message);
        }
    },

    getAllShipments: async () => {
        const response = await API.get('/shipments');
        return response.data;
    },

    // 🆕 Shipment ka status (e.g., PENDING -> IN_TRANSIT -> DELIVERED) update karne ke liye
    updateShipmentStatus: async (id, newStatus) => {
        const response = await API.put(`/shipments/${id}/status?newStatus=${newStatus}`);
        return response.data;
    },

    assignToFirstAvailableDriver: async (shipmentId) => {
        const response = await API.put(`/shipments/${shipmentId}/assign-driver`);
        return response.data;
    },

    getDriverRequests: async (userId) => {
        const response = await API.get(`/shipments/driver/requests/${userId}`);
        return response.data;
    },


    respondToRequest: async (shipmentId, action) => {
        const response = await API.put(`/shipments/${shipmentId}/respond?action=${action}`);
        return response.data;
    },

    async acceptShipment(shipmentId, userId) {
        const response = await API.post(`/shipments/accept/${shipmentId}/${userId}`);
        return response.data;
    },

    async declineShipment(shipmentId) {
        const response = await API.post(`/shipments/decline/${shipmentId}`);
        return response.data;
    },

    getActiveTrips: async (userId) => {
        const response = await API.get(`/shipments/driver/active/${userId}`);
        return response.data;
    },

    getDriverShipments: async (driverUserId) => {
        try {
            // Updated endpoint to fetch ALL driver shipments (active + delivered)
            const response = await API.get(`/shipments/driver/all/${driverUserId}`);
            return response.data;
        } catch (error) {
            console.warn("Could not fetch driver history, falling back:", error);
            return [];
        }
    }

};