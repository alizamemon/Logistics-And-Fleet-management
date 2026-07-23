import API from "./api";

export const customerService = {
    // 1. Get Customer by Phone
    getCustomerByPhone: async (phone) => {
        const response = await API.get(`/customers/phone/${phone}`);
        return response.data;
    },

    // 2. Create/Register New Customer
    registerCustomer: async (customerData) => {
        const response = await API.post('/customers', customerData);
        return response.data;
    }
};