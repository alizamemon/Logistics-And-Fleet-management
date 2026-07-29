import API from './api';

// Simple Helper to format Date matching Java's @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
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
    pushLiveLocation: async (locationPayload) => {
        try {
            const rawTripId = locationPayload?.trip?.id || locationPayload?.tripId;
            const validTripId = rawTripId ? Number(rawTripId) : null;

            const safePayload = {
                latitude: Number(locationPayload.latitude),
                longitude: Number(locationPayload.longitude),
                location: String(locationPayload.location || 'In Transit'),
                timestamp: formatTimestampForJava(new Date()), // 👈 Fixes @JsonFormat("yyyy-MM-dd HH:mm:ss")
                trip: {
                    id: validTripId // 👈 Matches @ManyToOne JoinColumn(name = "trip_id")
                }
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