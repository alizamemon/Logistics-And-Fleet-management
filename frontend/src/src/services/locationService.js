import API from './api'; // 👈 Aapka banaya hua axios instance

export const locationService = {
    /**
     * Sends live GPS simulation coordinate logs to the backend.
     * @param {Object} locationPayload { latitude, longitude, timestamp, trip: { id } }
     */
    pushLiveLocation: async (locationPayload) => {
        try {
            const response = await API.post('/location-history', locationPayload);
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