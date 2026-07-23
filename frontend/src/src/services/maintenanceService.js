import api from './api';

export const maintenanceService = {
    // Get all maintenance logs
    getAllMaintenanceLogs: async () => {
        const response = await api.get('/maintenance-logs');
        return response.data;
    },

    // Get maintenance logs paged
    getAllMaintenanceLogsPaged: async (page = 0, size = 10) => {
        const response = await api.get(`/maintenance-logs/paged?page=${page}&size=${size}`);
        return response.data;
    },

    // Get history by Vehicle ID
    getHistoryByVehicleId: async (vehicleId) => {
        const response = await api.get(`/maintenance-logs/vehicle/${vehicleId}`);
        return response.data;
    },

    // Create Manual Maintenance Log
    createMaintenanceLog: async (logData) => {
        const response = await api.post('/maintenance-logs', logData);
        return response.data;
    },

    // 🎯 Settle Bill and Release Vehicle
    settleMaintenanceBill: async (id, cost) => {
        const response = await api.put(`/maintenance-logs/${id}/settle?cost=${cost}`);
        return response.data;
    },

    // Delete Log
    deleteMaintenanceLog: async (id) => {
        const response = await api.delete(`/maintenance-logs/${id}`);
        return response.data;
    }
};