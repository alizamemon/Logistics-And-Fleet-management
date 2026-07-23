import api from './api';

export const incidentService = {
    // Report Incident (Driver)
    reportIncident: async (incidentData) => {
        const response = await api.post('/incident', incidentData);
        return response.data;
    },

    // Get All Incidents (Admin)
    getAllIncidents: async () => {
        const response = await api.get('/incident');
        return response.data;
    },

    // Get Unresolved
    getUnresolvedIncidents: async () => {
        const response = await api.get('/incident/unresolved');
        return response.data;
    },

    // Get Incidents by Trip
    getIncidentsByTripId: async (tripId) => {
        const response = await api.get(`/incident/trip/${tripId}`);
        return response.data;
    },

    // ➕ Get Incidents by Shipment
    getIncidentsByShipmentId: async (shipmentId) => {
        const response = await api.get(`/incident/shipment/${shipmentId}`);
        return response.data;
    },

    // Resolve Incident (Admin)
    resolveIncident: async (id) => {
        const response = await api.put(`/incident/${id}/resolve`);
        return response.data;
    },

    // Delete Incident
    deleteIncident: async (id) => {
        const response = await api.delete(`/incident/${id}`);
        return response.data;
    }
};