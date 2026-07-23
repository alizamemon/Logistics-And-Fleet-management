import api from './api';

export const vehicleService = {
    // Sab vehicles dekhne ke liye (Admin/Employee dono ke liye)
    getAllVehicles: async () => {
        const response = await api.get('/vehicle');
        return response.data;
    },

    // Sirf available vehicles (Shipment booking ke waqt dropdown ke liye)
    getAvailableVehicles: async () => {
        const response = await api.get('/vehicle/available');
        return response.data;
    },

    // Naya vehicle add karne ke liye (Sirf ADMIN)
    createVehicle: async (vehicleData) => {
        const response = await api.post('/vehicle', vehicleData);
        return response.data;
    },

    // Status change karne ke liye (Jaise manually Maintenance par bhejna ho)
    updateVehicle: async (id, vehicleData) => {
        const response = await api.put(`/vehicle/${id}`, vehicleData);
        return response.data;
    }
};