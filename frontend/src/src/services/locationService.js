import API from './api';

export const locationService = {
    /**
     * Sends live GPS simulation coordinate logs to the backend.
     * @param {Object} locationPayload
     */
    pushLiveLocation: async (locationPayload) => {
        // Component se aayi hui trip ID nikaali
        const tripId = locationPayload?.trip?.id || locationPayload?.tripId;

        // Direct standard DTO payload format backend ke liye
        const safePayload = {
            latitude: locationPayload.latitude,
            longitude: locationPayload.longitude,
            location: locationPayload.location,
            timestamp: locationPayload.timestamp,
            tripId: Number(tripId),          // 👈 Spring Boot AWS DTO ki zaroorat
            trip: { id: Number(tripId) }     // 👈 Nested Safety Check
        };

        const response = await API.post('/location-history', safePayload);
        return response.data;
    }, // 👈 YAHAN COMMA (,) ZAROORI HAI

    getLocationHistoryLogs: async (page = 0, size = 10, tripId = '') => {
        let url = `/location-history?page=${page}&size=${size}`;
        if (tripId) {
            url += `&tripId=${tripId}`;
        }
        const response = await API.get(url);
        return response.data;
    }
};