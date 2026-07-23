import API from './api'; // Centralized Axios instance with JWT interceptor

export const fuelLogService = {
    // 1. Submit Driver Log
    submitDriverLog: async ({ tripId, actualDistance, refueled, litersFilled, stationName, pricePerLiter = 270.0 }) => {
        try {
            const response = await API.post('/fuel-logs/submit-driver-log', null, {
                params: {
                    tripId,
                    actualDistance,
                    refueled,
                    litersFilled: refueled ? litersFilled : 0,
                    stationName: refueled ? stationName : '',
                    pricePerLiter
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error submitting driver fuel log:", error);
            throw error;
        }
    },

    // 2. Fetch All Fuel Logs
    getAllFuelLogs: async () => {
        try {
            const response = await API.get('/fuel-logs');
            return response.data;
        } catch (error) {
            console.error("Error fetching fuel logs:", error);
            throw error;
        }
    },

    // 3. Fetch Paged Fuel Logs
    getAllFuelLogsPaged: async (page = 0, size = 10) => {
        try {
            const response = await API.get('/fuel-logs/paged', {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching paged fuel logs:", error);
            throw error;
        }
    },

    // 4. Get Fuel Log by ID
    getFuelLogById: async (id) => {
        try {
            const response = await API.get(`/fuel-logs/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching fuel log #${id}:`, error);
            throw error;
        }
    },

    // 5. Get Fuel Logs by Trip ID
    getFuelLogsByTripId: async (tripId) => {
        try {
            const response = await API.get(`/fuel-logs/trip/${tripId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching fuel logs for trip #${tripId}:`, error);
            throw error;
        }
    },

    // 6. Update Fuel Log (Admin Only)
    updateFuelLog: async (id, fuelLogDetails) => {
        try {
            const response = await API.put(`/fuel-logs/${id}`, fuelLogDetails);
            return response.data;
        } catch (error) {
            console.error(`Error updating fuel log #${id}:`, error);
            throw error;
        }
    },

    // 7. Delete Fuel Log (Admin Only)
    deleteFuelLog: async (id) => {
        try {
            const response = await API.delete(`/fuel-logs/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting fuel log #${id}:`, error);
            throw error;
        }
    }
};