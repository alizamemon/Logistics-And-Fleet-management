import React, { useState } from 'react';
import { incidentService } from '../services/incidentService';

const DriverIncidentModal = ({ trip, isOpen, onClose, showNotification }) => {
    const [incidentType, setIncidentType] = useState('TYRE_BURST');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [incidentLocation, setIncidentLocation] = useState('');

    if (!isOpen || !trip) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // 1. Asli Trip ID & Shipment ID extract karein
        const actualTripId = trip?.trip?.id || trip?.tripId || null;
        const actualShipmentId = trip?.shipment?.id || trip?.shipmentId || trip?.id || null;

        // 2. Clean payload create karein
        const payload = {
            incidentType: incidentType,
            description: `Location: ${incidentLocation} | Details: ${description}`,
            resolved: false,
            reportedAt: new Date().toISOString(),

            // 🚨 CRUCIAL FIX: Sirf tab object bhejain jab actual tripId non-null ho!
            ...(actualTripId && { trip: { id: Number(actualTripId) } }),
            ...(actualShipmentId && { shipment: { id: Number(actualShipmentId) } })
        };

        try {
            await incidentService.reportIncident(payload);
            if (showNotification) {
                showNotification("🚨 Emergency Incident Reported Successfully!", "warning");
            } else {
                alert("Incident reported successfully!");
            }

            setDescription('');
            setIncidentLocation('');
            onClose();
        } catch (err) {
            console.error("Failed to report incident:", err);
            if (showNotification) {
                showNotification("Failed to submit incident report.", "error");
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-white">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h2 className="text-lg font-bold !text-red-400 flex items-center gap-2">
                        <span>🚨</span> Report Emergency Incident
                    </h2>
                    <span className="text-xs font-mono bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-lg">
                        ID #{trip.id || 'N/A'}
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Incident Type Dropdown */}
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">
                            Incident Category
                        </label>
                        <select
                            value={incidentType}
                            onChange={(e) => setIncidentType(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                        >
                            <option value="TYRE_BURST">🔘 Tyre Burst / Flat Tyre</option>
                            <option value="ENGINE_FAILURE">🔧 Engine Breakdown</option>
                            <option value="ACCIDENT">💥 Road Accident</option>
                            <option value="TRAFFIC_BLOCK">🚧 Severe Route Blockage</option>
                            <option value="OTHER">⚠️ Other Emergency</option>
                        </select>
                    </div>

                    {/* Location Input */}
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">
                            Reported at
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Near M2 Sukkur Toll Plaza"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                            value={incidentLocation}
                            onChange={(e) => setIncidentLocation(e.target.value)}
                        />
                    </div>

                    {/* Incident Details Input */}
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">
                            Description
                        </label>
                        <textarea
                            required
                            rows={2}
                            placeholder="Describe what happened..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-xs font-semibold text-white rounded-xl cursor-pointer shadow-lg shadow-red-600/30"
                        >
                            {loading ? 'Submitting...' : 'Submit Incident Alert'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DriverIncidentModal;