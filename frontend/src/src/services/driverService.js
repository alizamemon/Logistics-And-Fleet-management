import API from './api';

export const driverService = {

    getDriverByUserId: async (userId) => {
        const response = await API.get(`/driver/user/${userId}`);
        return response.data;
    },

    onboardDriver: async (userId, licenseNumber, phone) => {
        const response = await API.put(
            `/driver/onboard/${userId}?licenseNumber=${licenseNumber}&phone=${phone}`
        );
        return response.data;
    },

    getAllDrivers: async () => {
        const response = await API.get('/driver');
        return response.data;
    },

    getAvailableDrivers: async () => {
        const response = await API.get('/driver/available');
        return response.data;
    },

    updateDriver: async (id, driverData) => {
        const response = await API.put(`/driver/${id}`, driverData);
        return response.data;
    },

    deleteDriver: async (id) => {
        const response = await API.delete(`/driver/${id}`);
        return response.data;
    }
};