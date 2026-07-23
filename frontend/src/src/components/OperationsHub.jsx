import React, { useState, useEffect } from 'react';
import { shipmentService } from '../services/shipmentService';
import TripsRegistry from './TripsRegistry'; // 👈 Naya component import kar liya

const OperationsHub = ({ showNotification }) => {
    // 📍 New Sub-Tab State: 'SHIPMENTS' | 'TRIPS'
    const [subTab, setSubTab] = useState('SHIPMENTS');

    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('PENDING');

    const loadShipments = async () => {
        try {
            setLoading(true);
            const data = await shipmentService.getAllShipments();
            setShipments(data || []);
        } catch (err) {
            console.error("Error fetching shipments:", err);
            showNotification("Failed to fetch shipments catalog.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadShipments();
    }, []);

    const handleAutoDispatch = async (id) => {
        try {
            const updatedShipment = await shipmentService.assignToFirstAvailableDriver(id);
            showNotification(`Driver assigned successfully! Status: ${updatedShipment.status}`, "success");

            setShipments(prev => prev.map(ship =>
                ship.id === id ? { ...ship, status: updatedShipment.status, driver: updatedShipment.driver } : ship
            ));
        } catch (err) {
            console.error("Auto dispatch failed:", err);
            const errorMsg = err.response?.data?.message || "No active/available driver found for FIFO dispatch.";
            showNotification(errorMsg, "error");
        }
    };

    const handleStatusChange = async (id, currentStatus) => {
        const nextStatuses = {
            'PENDING': 'ON_GOING',
            'ASSIGNED_PENDING_ACCEPTANCE': 'ON_GOING',
            'ON_GOING': 'DELIVERED',
            'DELIVERED': 'PENDING'
        };
        const nextStatus = nextStatuses[currentStatus] || 'PENDING';

        try {
            await shipmentService.updateShipmentStatus(id, nextStatus);
            showNotification(`Shipment status updated to ${nextStatus}`, "success");
            setShipments(prev => prev.map(ship =>
                ship.id === id ? { ...ship, status: nextStatus } : ship
            ));
        } catch (err) {
            showNotification("Failed to update shipment status.", "error");
        }
    };

    const filteredShipments = shipments.filter(ship => {
        if (statusFilter === 'ALL') return true;
        return ship.status === statusFilter;
    });

    return (
        <div className="space-y-6">
            {/* 🔘 SUB-TAB SWITCHER BUTTONS */}
            <div className="flex gap-3 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 max-w-fit">
                <button
                    onClick={() => setSubTab('SHIPMENTS')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        subTab === 'SHIPMENTS'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    📦 Shipments Registry
                </button>
                <button
                    onClick={() => setSubTab('TRIPS')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        subTab === 'TRIPS'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    🚚 Fleet Trips Registry
                </button>
            </div>

            {/* 📦 SUB-TAB 1: SHIPMENTS REGISTRY VIEW */}
            {subTab === 'SHIPMENTS' && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                        <div>
                            <h2 className="text-lg font-bold !text-white tracking-tight">Active Shipments Registry</h2>
                            <p className="text-slate-400 text-xs mt-1">Manage, update, and dispatch packages awaiting transport.</p>
                        </div>

                        {/* Status Filter Tabs */}
                        <div className="flex gap-1.5 bg-slate-950/40 p-1 rounded-xl border border-slate-800/60 overflow-x-auto w-full sm:w-auto">
                            {['ALL', 'PENDING', 'ASSIGNED_PENDING_ACCEPTANCE', 'ON_GOING', 'DELIVERED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                        statusFilter === status
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                    }`}
                                >
                                    {status === 'ALL'
                                        ? 'Show All'
                                        : status === 'ASSIGNED_PENDING_ACCEPTANCE'
                                            ? 'Pending Accept'
                                            : status === 'ON_GOING'
                                                ? 'ON GOING'
                                                : status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-slate-400 text-xs animate-pulse">Syncing shipment ledger...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-800/80 text-slate-300 text-xs font-bold tracking-wider uppercase border-b border-slate-800">
                                <tr>
                                    <th className="py-4 px-4 pl-6">ID</th>
                                    <th className="py-4 px-4">Tracking Code</th>
                                    <th className="py-4 px-4">Receiver</th>
                                    <th className="py-4 px-4">Destination</th>
                                    <th className="py-4 px-4">Weight & Price</th>
                                    <th className="py-4 px-4">Status</th>
                                    <th className="py-4 px-6 text-center">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800 text-sm text-gray-200 bg-black/10">
                                {filteredShipments.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="p-10 text-center text-slate-500 text-xs">No shipments found.</td>
                                    </tr>
                                ) : (
                                    filteredShipments.map((ship) => (
                                        <tr key={ship.id} className="hover:bg-slate-800/30 transition-all">
                                            <td className="py-4 px-4 pl-6 font-mono text-slate-500 text-xs">#{ship.id}</td>
                                            <td className="py-4 px-4 font-mono font-bold text-blue-400 text-xs">{ship.trackingNumber}</td>
                                            <td className="py-4 px-4">
                                                <div className="font-semibold text-white">{ship.receiverName}</div>
                                                <div className="text-xs text-slate-400 font-mono">{ship.receiverPhone}</div>
                                                {ship.driver && (
                                                    <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                                                        <span>🚗 Driver:</span>
                                                        <span className="font-bold font-mono">{ship.driver.fullName}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-xs font-medium">{ship.deliveryCity}</td>
                                            <td className="py-4 px-4 font-mono text-xs">
                                                <div>{ship.weight} kg</div>
                                                <div className="text-emerald-400 font-bold">{ship.price} PKR</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest ${
                                                        ship.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                            ship.status === 'ASSIGNED_PENDING_ACCEPTANCE' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' :
                                                                ship.status === 'ON_GOING' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    }`}>
                                                        {ship.status === 'ASSIGNED_PENDING_ACCEPTANCE' ? 'Pending Accept' : ship.status === 'ON_GOING' ? 'ON GOING' : ship.status}
                                                    </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex gap-2 justify-center">
                                                    {ship.status === 'PENDING' ? (
                                                        <button
                                                            onClick={() => handleAutoDispatch(ship.id)}
                                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1 shadow-lg shadow-blue-500/20 border border-blue-500/50"
                                                        >
                                                            Auto Dispatch
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleStatusChange(ship.id, ship.status)}
                                                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[10px] font-bold rounded-xl cursor-pointer transition-all"
                                                        >
                                                            🔄 Next Status
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* 🚚 SUB-TAB 2: TRIPS REGISTRY VIEW */}
            {subTab === 'TRIPS' && (
                <TripsRegistry showNotification={showNotification} />
            )}
        </div>
    );
};

export default OperationsHub;