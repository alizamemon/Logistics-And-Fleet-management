import API from './api';

const formatTimestampForJava = (date = new Date()) => {
    const pad = (num) => String(num).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const locationService = {
    // 1. Matches @PostMapping
    pushLiveLocation: async (locationPayload) => {
        try {
            const rawTripId = locationPayload?.trip?.id || locationPayload?.tripId;
            const validTripId = rawTripId ? Number(rawTripId) : null;

            const safePayload = {
                latitude: Number(locationPayload.latitude),
                longitude: Number(locationPayload.longitude),
                location: String(locationPayload.location || 'In Transit'),
                timestamp: formatTimestampForJava(new Date()),
                trip: {
                    id: validTripId
                }
            };

            const response = await API.post('/location-history', safePayload);
            return response.data;
        } catch (error) {
            console.error("Error pushing live coordinate:", error);
            throw error;
        }
    },

    // 2. Matches @GetMapping("/trip/{tripId}") -> Returns List<LocationsHistory>
    getLocationHistory: async (tripId) => {
        try {
            const response = await API.get(`/location-history/trip/${tripId}`);
            return response.data; // 👈 Directly return response.data (Array)
        } catch (error) {
            console.error("Error fetching trip location history:", error);
            throw error;
        }
    },

    // 3. Matches @GetMapping (Paged Response)
    getLocationHistoryLogs: async (page = 0, size = 10, tripId = '') => {
        let url = `/location-history?page=${page}&size=${size}`;
        if (tripId) {
            url += `&tripId=${tripId}`;
        }
        const response = await API.get(url);
        return response.data;
    }
};