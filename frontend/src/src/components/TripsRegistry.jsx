import React, { useState, useEffect } from 'react';
import API from '../services/api';

const TripsRegistry = ({ showNotification }) => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchTrips = async () => {
        setLoading(true);
        try {
            // Adjust endpoint according to your backend
            const response = await API.get('/trips');
            let data = Array.isArray(response.data) ? response.data : (response.data?.content || []);
            setTrips(data);
        } catch (err) {
            console.error("Failed to fetch trips:", err);
            if (showNotification) {
                showNotification("Failed to load trips data.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-base font-bold !text-white">Active & Completed Fleet Journeys</h2>
                <button
                    onClick={fetchTrips}
                    className="text-xs text-blue-400 hover:underline cursor-pointer"
                >
                    🔄 Refresh Trips
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-slate-400 text-xs animate-pulse">
                    Loading active trip manifest...
                </div>
            ) : trips.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                    No active trip records found.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                            <th className="py-3 px-4">Trip Number</th>
                            <th className="py-3 px-4">Route (Source ➔ Dest)</th>
                            <th className="py-3 px-4">Assigned Driver</th>
                            <th className="py-3 px-4">Vehicle ID</th>
                            <th className="py-3 px-4">Start Time</th>
                            <th className="py-3 px-4">End Time</th>
                            <th className="py-3 px-4">Status</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                        {trips.map((trip) => (
                            <tr key={trip.id} className="hover:bg-slate-800/40 transition-all">
                                <td className="py-3 px-4 text-indigo-400 font-bold">
                                    {trip.tripNumber || `#TRP-${trip.id}`}
                                </td>
                                <td className="py-3 px-4 text-white font-sans font-medium">
                                    {trip.sourceCity || 'Karachi Hub'} ➔ <span className="text-amber-400">{trip.destinationCity}</span>
                                </td>
                                <td className="py-3 px-4 text-slate-300 font-sans">
                                    👤 Driver #{trip.driver?.id || trip.driverId || 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-cyan-400 font-bold">
                                    🚛 Vehicle #{trip.vehicle?.id || trip.vehicleId || 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-slate-400 text-[11px] font-sans">
                                    {trip.startDate ? new Date(trip.startDate).toLocaleString() : 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-slate-400 text-[11px] font-sans">
                                    {trip.endDate ? new Date(trip.endDate).toLocaleString() : 'En Route'}
                                </td>
                                <td className="py-3 px-4 font-sans">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                                            trip.status === 'COMPLETED'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : trip.status === 'IN_TRANSIT'
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        }`}>
                                            {trip.status || 'PLANNED'}
                                        </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TripsRegistry;