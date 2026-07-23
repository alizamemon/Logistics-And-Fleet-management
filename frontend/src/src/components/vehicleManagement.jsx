import React, { useState, useEffect } from 'react';
import { vehicleService } from '../services/vehicleService.js';
import { Truck, Plus, CheckCircle, AlertTriangle, PenTool, Trash2, Edit2, X, Check } from 'lucide-react';

const VehicleManagement = ({ currentUser, showNotification }) => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form states for creating new vehicle
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [model, setModel] = useState('');
    const [capacity, setCapacity] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Inline Editing States
    const [editingId, setEditingId] = useState(null);
    const [editModel, setEditModel] = useState('');
    const [editVehicleNumber, setEditVehicleNumber] = useState('');
    const [editCapacity, setEditCapacity] = useState('');

    const isAdmin = currentUser?.role === 'ADMIN';

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const data = await vehicleService.getAllVehicles();
            setVehicles(data);
        } catch (err) {
            console.error(err);
            showNotification("Could not fetch fleet details.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVehicle = async (id, vehicleNumber) => {
        if (window.confirm(`Are you sure you want to delete vehicle ${vehicleNumber}?`)) {
            try {
                await vehicleService.deleteVehicle(id);
                showNotification("Vehicle deleted successfully!", "success");
                fetchVehicles();
            } catch (err) {
                console.error(err);
                showNotification("Failed to delete vehicle. It might be assigned to a trip.", "error");
            }
        }
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await vehicleService.createVehicle({
                vehicleNumber,
                model,
                capacity: parseInt(capacity),
                status: 'AVAILABLE'
            });
            showNotification("New vehicle registered successfully!", "success");
            setVehicleNumber('');
            setModel('');
            setCapacity('');
            fetchVehicles();
        } catch (err) {
            console.error(err);
            showNotification("Failed to add vehicle. Number might already exist.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    // Edit Mode On karne ke liye function
    const startEditing = (vehicle) => {
        setEditingId(vehicle.id);
        setEditModel(vehicle.model);
        setEditVehicleNumber(vehicle.vehicleNumber);
        setEditCapacity(vehicle.capacity);
    };

    // Edit Mode Cancel karne ke liye
    const cancelEditing = () => {
        setEditingId(null);
    };

    // Saari fields ko backend par update karne ke liye (Your actual update API call)
    const handleUpdateVehicle = async (id, currentStatus) => {
        try {
            const updatedData = {
                id: id,
                model: editModel,
                vehicleNumber: editVehicleNumber,
                capacity: parseInt(editCapacity),
                status: currentStatus // status dropdown se hi rhega
            };

            await vehicleService.updateVehicle(id, updatedData);
            showNotification("Vehicle updated successfully!", "success");
            setEditingId(null);
            fetchVehicles(); // Refresh UI
        } catch (err) {
            console.error("Failed to update vehicle:", err);
            showNotification("Failed to update vehicle details.", "error");
        }
    };

    // Dropdown se sirf status update karne ke liye
    const handleStatusChange = async (vehicle, newStatus) => {
        try {
            const updatedData = {
                ...vehicle,
                status: newStatus
            };
            await vehicleService.updateVehicle(vehicle.id, updatedData);
            setVehicles(prev => prev.map(v => v.id === vehicle.id ? { ...v, status: newStatus } : v));
            showNotification("Status updated successfully!", "success");
        } catch (err) {
            console.error("Failed to update status:", err);
            showNotification("Failed to update status.", "error");
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    return (
        <div className="space-y-8 p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                    <h2 className="text-xl font-bold !text-slate-100 flex items-center gap-2">
                        <Truck className="h-5 w-5 text-blue-400" /> Fleet Management
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Monitor, register, and manage vehicles for shipments.</p>
                </div>
            </div>

            {/* 1. Register New Vehicle Form */}
            {isAdmin && (
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                        <Plus className="h-4 w-4 text-green-400" /> Register New Vehicle (Admin Only)
                    </h3>
                    <form onSubmit={handleAddVehicle} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Vehicle Number (e.g. KE-8932)"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value)}
                            className="bg-slate-950 border border-slate-800 focus:border-blue-400 px-3 py-2 rounded-xl text-xs text-slate-100 focus:outline-none placeholder:text-slate-700"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Model (e.g. Hino Dutro Truck)"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="bg-slate-950 border border-slate-800 focus:border-blue-400 px-3 py-2 rounded-xl text-xs text-slate-100 focus:outline-none placeholder:text-slate-700"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Capacity (in kg)"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            className="bg-slate-950 border border-slate-800 focus:border-blue-400 px-3 py-2 rounded-xl text-xs text-slate-100 focus:outline-none placeholder:text-slate-700"
                            required
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-[11px] uppercase tracking-wider py-2 rounded-xl transition-all disabled:opacity-50"
                        >
                            {submitting ? "Adding..." : "Add Vehicle"}
                        </button>
                    </form>
                </div>
            )}

            {/* 2. Fleet List */}
            <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-4 bg-slate-900/40 border-b border-slate-800">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Fleet List</h3>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500 text-xs animate-pulse">Scanning telemetry...</div>
                ) : vehicles.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-xs">No vehicles registered in the system yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider bg-slate-950/40">
                                <th className="p-4 font-bold">Vehicle Info</th>
                                <th className="p-4 font-bold">Capacity</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold">Action/Notes</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 text-xs">
                            {vehicles.map((v) => {
                                const isEditing = editingId === v.id;
                                return (
                                    <tr key={v.id} className="hover:bg-slate-900/10 transition-colors">
                                        {/* Vehicle Info Cell */}
                                        <td className="p-4">
                                            {isEditing ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={editModel}
                                                        onChange={(e) => setEditModel(e.target.value)}
                                                        className="bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded px-2 py-1 focus:outline-none focus:border-blue-500 w-full"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editVehicleNumber}
                                                        onChange={(e) => setEditVehicleNumber(e.target.value)}
                                                        className="bg-slate-950 border border-slate-800 text-slate-500 text-[10px] rounded px-2 py-1 focus:outline-none focus:border-blue-500 w-full"
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="font-semibold text-slate-100">{v.model}</div>
                                                    <div className="text-[10px] text-slate-500 mt-0.5">{v.vehicleNumber}</div>
                                                </>
                                            )}
                                        </td>

                                        {/* Capacity Cell */}
                                        <td className="p-4">
                                            {isEditing ? (
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        value={editCapacity}
                                                        onChange={(e) => setEditCapacity(e.target.value)}
                                                        className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-blue-500 w-20"
                                                    />
                                                    <span className="text-[10px] text-slate-500">kg</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-300">{v.capacity} kg</span>
                                            )}
                                        </td>

                                        {/* Status Cell */}
                                        <td className="p-4">
                                            {v.status === 'AVAILABLE' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                                                    <CheckCircle className="h-3 w-3" /> Available
                                                </span>
                                            ) : v.status === 'UNDER_MAINTENANCE' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                                                    <PenTool className="h-3 w-3" /> Under Maintenance
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                    In Service
                                                </span>
                                            )}
                                        </td>

                                        {/* Action/Notes Cell */}
                                        <td className="p-4">
                                            {/* Agar user ADMIN ya EMPLOYEE hai (Yani dono ko controls mil rahe hain) */}
                                            {currentUser?.role === 'ADMIN' || currentUser?.role === 'EMPLOYEE' ? (
                                                <div className="flex items-center gap-3">
                                                    {isEditing ? (
                                                        // Inline Edit Mode Buttons (Dono ke liye)
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleUpdateVehicle(v.id, v.status)}
                                                                className="p-1.5 bg-green-600/20 text-green-400 border border-green-500/20 hover:bg-green-600/30 rounded-lg transition-all cursor-pointer"
                                                                title="Save Changes"
                                                            >
                                                                <Check className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={cancelEditing}
                                                                className="p-1.5 bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 rounded-lg transition-all cursor-pointer"
                                                                title="Cancel"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        // Normal Mode Controls
                                                        <>
                                                            {/* Status Dropdown (Dono ke liye accessible) */}
                                                            <select
                                                                value={v.status}
                                                                onChange={(e) => handleStatusChange(v, e.target.value)}
                                                                className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-blue-500 cursor-pointer"
                                                            >
                                                                <option value="AVAILABLE">Available</option>
                                                                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                                                                <option value="IN_SERVICE" disabled>In Service (On Trip)</option>
                                                            </select>

                                                            {/* Edit Button (Dono ke liye accessible) */}
                                                            <button
                                                                onClick={() => startEditing(v)}
                                                                className="p-1.5 bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600/20 rounded-lg transition-all cursor-pointer"
                                                                title="Edit Vehicle"
                                                            >
                                                                <Edit2 className="h-3.5 w-3.5" />
                                                            </button>

                                                            {/* Trash/Delete Button (SIRF ADMIN KE LIYE) */}
                                                            {isAdmin && (
                                                                <button
                                                                    onClick={() => handleDeleteVehicle(v.id, v.vehicleNumber)}
                                                                    className="p-1.5 bg-red-600/10 text-red-400 border border-red-500/20 hover:bg-red-600/20 rounded-lg transition-all cursor-pointer"
                                                                    title="Delete Vehicle"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                /* Agar koi visitor ya reader role hai */
                                                v.status === 'UNDER_MAINTENANCE' ? (
                                                    <span className="text-[10px] text-amber-500/80 font-medium flex items-center gap-1">
                                                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                                        Service Required
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-500">Ready for assignment</span>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehicleManagement;