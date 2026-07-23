import API from "./api";

export const userService = {                          //user service is object

    register: async (formData) => {
        const response = await API.post('/users/register', formData);
        return response.data;
    },

    getAllUsers: async () => {
        const response = await API.get('/users');
        return response.data;
    },

    getAllUsersPaged: async (page = 0, size = 10) => {
        const response = await API.get(`/users/paged?page=${page}&size=${size}`);
        return response.data;
    },

    getUserById: async (id) => {
        const response = await API.get(`/users/${id}`);
        return response.data;
    },

    getUserByUsername: async (username) => {
        const response = await API.get(`/users/username/${username}`);
        return response.data;
    },

    updateUser: async (id, updatedDetails) => {
        const response = await API.put(`/users/${id}`, updatedDetails);
        return response.data;
    },

    promoteToAdmin: async (id) => {
        const response = await API.put(`/users/${id}/promote`);
        return response.data;
    },

    promoteToEmployee: async (id) => {
        const response = await API.put(`/users/${id}/promote-employee`);
        return response.data;
    },

    makeDriver: async (id) => {
        const response = await API.put(`/users/${id}/make-driver`);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await API.delete(`/users/${id}`);
        return response.data;
    },

    login: async (credentials) => {
        const response = await API.post('/users/login', credentials);

        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.username);

            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token'); // token dismiss
        localStorage.removeItem('username');
        localStorage.removeItem('user');

        window.location.href = '/login';
    }
};