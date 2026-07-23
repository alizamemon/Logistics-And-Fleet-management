import React, { useState, useEffect } from 'react';
import { trackingService } from '../services/trackingService';
import { fuelLogService } from '../services/fuelLogService';
import { maintenanceService } from '../services/maintenanceService';
import { incidentService } from '../services/incidentService';
import { locationService } from '../services/locationService'; // 👈 Location Service Import

const LogsCenter = ({ showNotification }) => {
    // 📍 New Category: GPS_TELEMETRY
    const [logCategory, setLogCategory] = useState('TRACKING'); // TRACKING | GPS_TELEMETRY | FUEL | MAINTENANCE | INCIDENTS
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchShipmentId, setSearchShipmentId] = useState('');

    // 📄 Pagination States for GPS Telemetry Logs
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(10);
    const [searchTripId, setSearchTripId] = useState('');

    // Modal state for Checkpoint Manual Entry
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newLog, setNewLog] = useState({
        shipmentId: '',
        locationCity: '',
        statusActivity: ''
    });

    // 🔧 State for Settle Maintenance Modal
    const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
    const [settleLogId, setSettleLogId] = useState(null);
    const [settleCost, setSettleCost] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            if (logCategory === 'TRACKING') {
                let data;
                if (searchShipmentId.trim()) {
                    data = await trackingService.getLogsByShipmentId(searchShipmentId.trim());
                } else {
                    data = await trackingService.getAllTrackingLogs();
                }
                let parsedLogs = Array.isArray(data) ? data : (data?.content || []);
                setLogs(parsedLogs);

            } else if (logCategory === 'GPS_TELEMETRY') {
                // 📍 GPS Telemetry Logs (Paged & ORDER BY id DESC)
                const data = await locationService.getLocationHistoryLogs(currentPage, pageSize, searchTripId.trim());
                setLogs(data.content || []);
                setTotalPages(data.totalPages || 0);

            } else if (logCategory === 'FUEL') {
                const data = await fuelLogService.getAllFuelLogs();
                let parsedLogs = Array.isArray(data) ? data : (data?.content || []);
                setLogs(parsedLogs);

            } else if (logCategory === 'MAINTENANCE') {
                const data = await maintenanceService.getAllMaintenanceLogs();
                let parsedLogs = Array.isArray(data) ? data : (data?.content || []);
                setLogs(parsedLogs);

            } else if (logCategory === 'INCIDENTS') {
                const data = await incidentService.getAllIncidents();
                let parsedLogs = Array.isArray(data) ? data : (data?.content || []);
                setLogs(parsedLogs);
            }
        } catch (err) {
            console.error("Failed to fetch logs:", err);
            if (showNotification) {
                showNotification("Failed to load log records. Ensure server connection.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch logs on category or page changes
    useEffect(() => {
        fetchLogs();
    }, [logCategory, currentPage]);

    // Handle Checkpoint Manual Entry Form Submit
    const handleCreateLog = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                shipment: { id: parseInt(newLog.shipmentId) },
                locationCity: newLog.locationCity,
                statusActivity: newLog.statusActivity,
                timestamp: new Date().toISOString()
            };

            await trackingService.createTrackingLog(payload);

            if (showNotification) {
                showNotification("Checkpoint log added successfully!", "success");
            }

            setIsModalOpen(false);
            setNewLog({ shipmentId: '', locationCity: '', statusActivity: '' });
            fetchLogs();
        } catch (err) {
            console.error("Failed to create tracking log:", err);
            if (showNotification) {
                showNotification("Failed to add tracking log. Verify Shipment ID.", "error");
            }
        } finally {
            setSubmitting(false);
        }
    };

    // 🔧 Handle Settle Maintenance Form Submit
    const handleSettleMaintenance = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await maintenanceService.settleMaintenanceBill(settleLogId, parseFloat(settleCost));

            if (showNotification) {
                showNotification("Maintenance bill settled and Vehicle released to AVAILABLE!", "success");
            }

            setIsSettleModalOpen(false);
            setSettleLogId(null);
            setSettleCost('');
            fetchLogs();
        } catch (err) {
            console.error("Failed to settle maintenance bill:", err);
            if (showNotification) {
                showNotification("Failed to settle bill. Try again.", "error");
            }
        } finally {
            setSubmitting(false);
        }
    };

    // 🚨 Handle Resolve Incident Action
    const handleResolveIncident = async (incidentId) => {
        try {
            await incidentService.resolveIncident(incidentId);
            if (showNotification) {
                showNotification("Incident marked as RESOLVED!", "success");
            }
            fetchLogs();
        } catch (err) {
            console.error("Failed to resolve incident:", err);
            if (showNotification) {
                showNotification("Failed to resolve incident.", "error");
            }
        }
    };

    // 📍 Handler for GPS Search Filter
    const handleGpsSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchLogs();
    };

    return (
        <div className="space-y-6 text-white animate-fadeIn">
            {/* Header & Add Button */}
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight !text-white">📜 System Audit & Logs</h1>
                    <p className="text-slate-400 text-xs md:text-sm mt-1">
                        Monitor real-time operational tracking, GPS telemetry, fuel, fleet maintenance, and driver emergency audit logs.
                    </p>
                </div>
                {logCategory === 'TRACKING' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 cursor-pointer flex items-center gap-1.5"
                    >
                        <span>+</span> Add Checkpoint Log
                    </button>
                )}
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-3 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
                <button
                    onClick={() => { setLogCategory('TRACKING'); setCurrentPage(0); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        logCategory === 'TRACKING'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    📦 Shipment Tracking Logs
                </button>
                <button
                    onClick={() => { setLogCategory('GPS_TELEMETRY'); setCurrentPage(0); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        logCategory === 'GPS_TELEMETRY'
                            ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    📍 GPS Telemetry Logs
                </button>
                <button
                    onClick={() => { setLogCategory('FUEL'); setCurrentPage(0); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        logCategory === 'FUEL'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    ⛽ Fuel Logs
                </button>
                <button
                    onClick={() => { setLogCategory('MAINTENANCE'); setCurrentPage(0); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        logCategory === 'MAINTENANCE'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    🔧 Fleet Maintenance Logs
                </button>
                <button
                    onClick={() => { setLogCategory('INCIDENTS'); setCurrentPage(0); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        logCategory === 'INCIDENTS'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    🚨 Emergency Incident Logs
                </button>
            </div>

            {/* Search Filter for Tracking */}
            {logCategory === 'TRACKING' && (
                <div className="flex gap-3 max-w-md">
                    <input
                        type="text"
                        placeholder="Search by Shipment ID..."
                        value={searchShipmentId}
                        onChange={(e) => setSearchShipmentId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={fetchLogs}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                        Search
                    </button>
                </div>
            )}

            {/* 📍 Search Filter for GPS Telemetry */}
            {logCategory === 'GPS_TELEMETRY' && (
                <form onSubmit={handleGpsSearch} className="flex gap-3 max-w-md">
                    <input
                        type="text"
                        placeholder="Search by Trip ID..."
                        value={searchTripId}
                        onChange={(e) => setSearchTripId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                        Filter Trip
                    </button>
                    {searchTripId && (
                        <button
                            type="button"
                            onClick={() => { setSearchTripId(''); setCurrentPage(0); }}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                        >
                            Reset
                        </button>
                    )}
                </form>
            )}

            {/* Logs Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                {loading ? (
                    <div className="text-center py-10 text-slate-400 text-xs animate-pulse">
                        Loading log records...
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">
                        No records found for this category.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                                <th className="py-3 px-4">Log ID</th>
                                {logCategory === 'TRACKING' && (
                                    <>
                                        <th className="py-3 px-4">Shipment ID</th>
                                        <th className="py-3 px-4">Activity / Event</th>
                                        <th className="py-3 px-4">Location</th>
                                        <th className="py-3 px-4">Timestamp</th>
                                    </>
                                )}
                                {logCategory === 'GPS_TELEMETRY' && (
                                    <>
                                        <th className="py-3 px-4">Trip ID</th>
                                        <th className="py-3 px-4">Location Name</th>
                                        <th className="py-3 px-4">Coordinates (Lat, Lng)</th>
                                        <th className="py-3 px-4">Timestamp</th>
                                    </>
                                )}
                                {logCategory === 'FUEL' && (
                                    <>
                                        <th className="py-3 px-4">Trip ID</th>
                                        <th className="py-3 px-4">Station Name</th>
                                        <th className="py-3 px-4">Liters Filled</th>
                                        <th className="py-3 px-4">Actual Distance</th>
                                        <th className="py-3 px-4">Total Amount</th>
                                        <th className="py-3 px-4">Logged At</th>
                                    </>
                                )}
                                {logCategory === 'MAINTENANCE' && (
                                    <>
                                        <th className="py-3 px-4">Vehicle Number</th>
                                        <th className="py-3 px-4">Description</th>
                                        <th className="py-3 px-4">Service Cost</th>
                                        <th className="py-3 px-4">Logged At</th>
                                        <th className="py-3 px-4">Action / Release</th>
                                    </>
                                )}
                                {logCategory === 'INCIDENTS' && (
                                    <>
                                        <th className="py-3 px-4">Shipment ID</th>
                                        <th className="py-3 px-4">Trip ID</th>
                                        <th className="py-3 px-4">Category</th>
                                        <th className="py-3 px-4">Location & Details</th>
                                        <th className="py-3 px-4">Reported At</th>
                                        <th className="py-3 px-4">Status / Action</th>
                                    </>
                                )}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-mono">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-800/40 transition-all">
                                    <td className="py-3 px-4 text-slate-500">#{log.id}</td>

                                    {logCategory === 'TRACKING' && (
                                        <>
                                            <td className="py-3 px-4 text-blue-400 font-bold font-mono">
                                                #{log.shipment?.id || log.shipmentId || log.shipment || 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 text-emerald-400 font-sans font-medium">
                                                {log.statusActivity}
                                            </td>
                                            <td className="py-3 px-4 text-slate-300 font-sans">
                                                📍 {log.locationCity || 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 text-slate-400 text-[11px]">
                                                {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                                            </td>
                                        </>
                                    )}

                                    {/* 📍 GPS TELEMETRY ROW */}
                                    {logCategory === 'GPS_TELEMETRY' && (
                                        <>
                                            <td className="py-3 px-4 text-cyan-400 font-bold">
                                                #{log.trip?.id || log.tripId || 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 text-slate-200 font-sans font-medium">
                                                <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded text-[11px]">
                                                    📍 {log.location || 'En Route'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-400 text-[11px]">
                                                {log.latitude?.toFixed(4)}, {log.longitude?.toFixed(4)}
                                            </td>
                                            <td className="py-3 px-4 text-slate-400 text-[11px] font-sans">
                                                {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                                            </td>
                                        </>
                                    )}

                                    {logCategory === 'FUEL' && (
                                        <>
                                            <td className="py-3 px-4 text-purple-400 font-bold">
                                                #{log.trip?.id || log.tripId || 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 text-slate-200 font-sans font-medium">
                                                ⛽ {log.stationName || 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 text-amber-400 font-bold">
                                                {log.litersFilled ? `${log.litersFilled} L` : '0 L'}
                                            </td>
                                            <td className="py-3 px-4 text-cyan-400 font-bold">
                                                {log.actualDistance ? `${log.actualDistance} KM` : 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 text-emerald-400 font-bold">
                                                Rs. {log.totalAmount ? log.totalAmount.toLocaleString() : 0}
                                            </td>
                                            <td className="py-3 px-4 text-slate-400 text-[11px]">
                                                {log.loggedAt ? new Date(log.loggedAt).toLocaleString() : 'N/A'}
                                            </td>
                                        </>
                                    )}

                                    {logCategory === 'MAINTENANCE' && (
                                        <>
                                            <td className="py-3 px-4 text-amber-400 font-bold">
                                                🚛 {log.vehicle?.vehicleNumber || 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 text-slate-200 font-sans font-medium">
                                                {log.description}
                                            </td>
                                            <td className="py-3 px-4 text-emerald-400 font-bold">
                                                {log.cost > 0 ? `Rs. ${log.cost.toLocaleString()}` : 'Pending Settle ($0.0)'}
                                            </td>
                                            <td className="py-3 px-4 text-slate-400 text-[11px]">
                                                {log.maintenanceDate ? new Date(log.maintenanceDate).toLocaleString() : 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 font-sans">
                                                {log.vehicle?.status === 'IN_MAINTENANCE' ? (
                                                    <button
                                                        onClick={() => {
                                                            setSettleLogId(log.id);
                                                            setIsSettleModalOpen(true);
                                                        }}
                                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-1 rounded-lg transition-all shadow-md cursor-pointer"
                                                    >
                                                        🔧 Settle & Release
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-500 text-[11px]">Released</span>
                                                )}
                                            </td>
                                        </>
                                    )}

                                    {logCategory === 'INCIDENTS' && (
                                        <>
                                            <td className="py-3 px-4 text-emerald-400 font-bold">
                                                #{log.shipment?.id || 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 text-blue-400 font-bold">
                                                #{log.trip?.id || 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-red-400 font-sans">
                                                ⚠️ {log.incidentType}
                                            </td>
                                            <td className="py-3 px-4 text-slate-200 font-sans max-w-xs">
                                                {log.description}
                                            </td>
                                            <td className="py-3 px-4 text-slate-400 text-[11px]">
                                                {log.reportedAt ? new Date(log.reportedAt).toLocaleString() : 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 font-sans">
                                                {log.resolved ? (
                                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-[10px] font-bold">
                                                        RESOLVED
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleResolveIncident(log.id)}
                                                        className="bg-red-600/20 hover:bg-red-600 border border-red-500/40 hover:border-red-500 text-red-300 hover:text-white px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer shadow-sm"
                                                    >
                                                        Mark Resolved
                                                    </button>
                                                )}
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 📄 Pagination Controls for GPS Telemetry Category */}
                {logCategory === 'GPS_TELEMETRY' && totalPages > 1 && (
                    <div className="flex justify-between items-center pt-4 border-t border-slate-800 mt-4">
                        <span className="text-xs text-slate-400">
                            Page <strong className="text-white">{currentPage + 1}</strong> of <strong className="text-white">{totalPages}</strong>
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 0}
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                                className="px-3 py-1.5 bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-xs rounded-xl transition-all cursor-pointer"
                            >
                                ◀ Previous
                            </button>
                            <button
                                disabled={currentPage + 1 >= totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="px-3 py-1.5 bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-xs rounded-xl transition-all cursor-pointer"
                            >
                                Next ▶
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Checkpoint Manual Entry Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
                        <h2 className="text-lg font-bold !text-white">➕ Add Checkpoint Log</h2>
                        <form onSubmit={handleCreateLog} className="space-y-3">
                            <div>
                                <label className="text-[11px] text-slate-400 block mb-1">Shipment ID</label>
                                <input
                                    type="number"
                                    required
                                    value={newLog.shipmentId}
                                    onChange={(e) => setNewLog({ ...newLog, shipmentId: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                                    placeholder="e.g. 5"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] text-slate-400 block mb-1">Location / City Hub</label>
                                <input
                                    type="text"
                                    required
                                    value={newLog.locationCity}
                                    onChange={(e) => setNewLog({ ...newLog, locationCity: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                                    placeholder="e.g. Lahore Transit Hub"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] text-slate-400 block mb-1">Activity Description</label>
                                <textarea
                                    required
                                    value={newLog.statusActivity}
                                    onChange={(e) => setNewLog({ ...newLog, statusActivity: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 h-20"
                                    placeholder="e.g. Parcel arrived at distribution center"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded-xl font-bold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs rounded-xl font-bold transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {submitting ? "Saving..." : "Save Log Entry"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🔧 Settle Maintenance Modal */}
            {isSettleModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
                        <h2 className="text-lg font-bold !text-white">🔧 Settle Bill & Release Vehicle</h2>
                        <p className="text-slate-400 text-xs">
                            Enter final repair/inspection cost to clear this maintenance log and mark vehicle as <b>AVAILABLE</b>.
                        </p>
                        <form onSubmit={handleSettleMaintenance} className="space-y-3">
                            <div>
                                <label className="text-[11px] text-slate-400 block mb-1">Total Maintenance Cost (PKR)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={settleCost}
                                    onChange={(e) => setSettleCost(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    placeholder="e.g. 15000"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSettleModalOpen(false);
                                        setSettleLogId(null);
                                    }}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded-xl font-bold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs rounded-xl font-bold transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {submitting ? "Processing..." : "Settle & Release"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogsCenter;