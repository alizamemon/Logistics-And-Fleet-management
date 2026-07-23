import api from './api';

export const trackingService = {

    // Fetch all tracking logs (Admin / Employee view)
    getAllTrackingLogs: async () => {
        const response = await api.get('/tracking-logs');
        return response.data;
    },

    // Fetch tracking logs by Shipment ID
    getLogsByShipmentId: async (shipmentId) => {
        const response = await api.get(`tracking-logs/shipment/${shipmentId}`);
        return response.data;
    },

    createTrackingLog: async (logData) => {
        const response = await api.post('/tracking-logs', logData);
        return response.data;
    }
};