import API from './api';

export const locationService = {
    /**
     * Sends live GPS simulation coordinate logs to the backend.
     * @param {Object} locationPayload
     */
    pushLiveLocation: async (locationPayload) => {
        try {
            // Safely extract trip ID from either nested object or flat field
            const extractedTripId = locationPayload?.trip?.id || locationPayload?.tripId;

            // Send BOTH formats so backend DTO accepts seamlessly on AWS
            const safePayload = {
                ...locationPayload,
                tripId: extractedTripId ? Number(extractedTripId) : null,
                trip: extractedTripId ? { id: Number(extractedTripId) } : locationPayload?.trip
            };

            const response = await API.post('/location-history', safePayload);
            return response.data;
        } catch (error) {
            console.error("Error pushing live coordinate inside locationService:", error);
            throw error;
        }
    },

    getLocationHistoryLogs: async (page = 0, size = 10, tripId = '') => {
        let url = `/location-history?page=${page}&size=${size}`;
        if (tripId) {
            url += `&tripId=${tripId}`;
        }
        const response = await API.get(url);
        return response.data;
    }
};