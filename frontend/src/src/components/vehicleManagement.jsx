import React, { useState, useEffect } from 'react';
import { vehicleService } from '../services/vehicleService.js';
import { Truck, Plus, CheckCircle, AlertTriangle, PenTool, Trash2, Edit2, X } from 'lucide-react';

const VehicleManagement = ({ currentUser, showNotification }) => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form states for creating new vehicle
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [model, setModel] = useState('');
    const [capacity, setCapacity] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Modal Edit States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingVehicleId, setEditingVehicleId] = useState(null);
    const [editModel, setEditModel] = useState('');
    const [editVehicleNumber, setEditVehicleNumber] = useState('');
    const [editCapacity, setEditCapacity] = useState('');
    const [editStatus, setEditStatus] = useState('AVAILABLE');
    const [updating, setUpdating] = useState(false);

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

    // Open Modal with selected vehicle details
    const openEditModal = (vehicle) => {
        setEditingVehicleId(vehicle.id);
        setEditModel(vehicle.model);
        setEditVehicleNumber(vehicle.vehicleNumber);
        setEditCapacity(vehicle.capacity);
        setEditStatus(vehicle.status);
        setIsEditModalOpen(true);
    };

    // Close Modal
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingVehicleId(null);
    };

    // Submit Modal Updates
    const handleSaveVehicleModal = async (e) => {
        e.preventDefault();
        try {
            setUpdating(true);
            const updatedData = {
                id: editingVehicleId,
                model: editModel,
                vehicleNumber: editVehicleNumber,
                capacity: parseInt(editCapacity),
                status: editStatus
            };

            await vehicleService.updateVehicle(editingVehicleId, updatedData);
            showNotification("Vehicle updated successfully!", "success");
            closeEditModal();
            fetchVehicles();
        } catch (err) {
            console.error("Failed to update vehicle:", err);
            showNotification("Failed to update vehicle details.", "error");
        } finally {
            setUpdating(false);
        }
    };

    // Quick Status Dropdown Change from Table
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
        <div className="space-y-6 md:space-y-8 animate-fadeIn">
            {/* Standardized Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-800/80 gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold !text-white tracking-tight flex items-center gap-2">
                        <span>🚚</span> Fleet Management
                    </h1>
                    <p className="text-slate-400 text-xs mt-1">
                        Monitor, register, and update operational vehicles across logistics routes.
                    </p>
                </div>
            </div>

            {/* 1. Register New Vehicle Form */}
            {isAdmin && (
                <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-md">
                    <h3 className="text-xs font-bold text-slate-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <Plus className="h-4 w-4 text-green-400" /> Register New Vehicle (Admin Only)
                    </h3>
                    <form onSubmit={handleAddVehicle} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Vehicle Number (e.g. KE-8932)"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value)}
                            className="bg-slate-950/60 border border-slate-800 focus:border-blue-500 px-4 py-2.5 rounded-xl text-xs text-slate-100 focus:outline-none placeholder:text-slate-600"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Model (e.g. Hino Dutro Truck)"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="bg-slate-950/60 border border-slate-800 focus:border-blue-500 px-4 py-2.5 rounded-xl text-xs text-slate-100 focus:outline-none placeholder:text-slate-600"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Capacity (in kg)"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            className="bg-slate-950/60 border border-slate-800 focus:border-blue-500 px-4 py-2.5 rounded-xl text-xs text-slate-100 focus:outline-none placeholder:text-slate-600"
                            required
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                        >
                            {submitting ? "Adding..." : "Add Vehicle"}
                        </button>
                    </form>
                </div>
            )}

            {/* 2. Fleet List */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                <div className="p-4 md:p-6 border-b border-slate-800/80">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Fleet List</h3>
                </div>

                {loading ? (
                    <div className="p-16 text-center text-slate-400 font-medium animate-pulse text-xs md:text-sm">Scanning telemetry...</div>
                ) : vehicles.length === 0 ? (
                    <div className="p-16 text-center text-slate-500 text-xs">No vehicles registered in the system yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-800/80 text-slate-300 text-xs font-bold tracking-wider uppercase border-b border-slate-800">
                            <tr>
                                <th className="py-4 px-6 font-bold">Vehicle Info</th>
                                <th className="py-4 px-6 font-bold">Capacity</th>
                                <th className="py-4 px-6 font-bold">Status</th>
                                <th className="py-4 px-6 font-bold text-center">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 text-sm text-gray-200 bg-black/10">
                            {vehicles.map((v) => (
                                <tr key={v.id} className="hover:bg-slate-800/30 transition-all">
                                    <td className="py-4 px-6">
                                        <div className="font-bold text-white">{v.model}</div>
                                        <div className="font-mono text-xs text-slate-400 mt-0.5">{v.vehicleNumber}</div>
                                    </td>

                                    <td className="py-4 px-6">
                                        <span className="text-slate-300 font-medium">{v.capacity} kg</span>
                                    </td>

                                    <td className="py-4 px-6">
                                        {v.status === 'AVAILABLE' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/30">
                                                    <CheckCircle className="h-3 w-3" /> Available
                                                </span>
                                        ) : v.status === 'UNDER_MAINTENANCE' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
                                                    <PenTool className="h-3 w-3" /> Under Maintenance
                                                </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                                                    In Service
                                                </span>
                                        )}
                                    </td>

                                    <td className="py-4 px-6 text-center">
                                        {currentUser?.role === 'ADMIN' || currentUser?.role === 'EMPLOYEE' ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <select
                                                    value={v.status}
                                                    onChange={(e) => handleStatusChange(v, e.target.value)}
                                                    className="bg-slate-950/80 border border-slate-800 text-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                                                >
                                                    <option value="AVAILABLE">Available</option>
                                                    <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                                                    <option value="IN_SERVICE" disabled>In Service (On Trip)</option>
                                                </select>

                                                {/* Open Edit Modal Button */}
                                                <button
                                                    onClick={() => openEditModal(v)}
                                                    className="p-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer hover:bg-slate-700 transition-all"
                                                    title="Edit Vehicle Details"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>

                                                {/* Admin Only Delete Button */}
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleDeleteVehicle(v.id, v.vehicleNumber)}
                                                        className="p-1.5 bg-red-600/10 text-red-400 border border-red-500/20 rounded-xl text-xs cursor-pointer hover:bg-red-600/20 transition-all"
                                                        title="Delete Vehicle"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            v.status === 'UNDER_MAINTENANCE' ? (
                                                <span className="text-xs text-amber-500/80 font-medium flex items-center justify-center gap-1">
                                                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Service Required
                                                    </span>
                                            ) : (
                                                <span className="text-xs text-slate-500">Ready for assignment</span>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 3. MODAL: MODIFY VEHICLE DETAILS */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-slate-950/40">
                            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                                <Truck className="h-4 w-4 text-blue-400" /> Modify Vehicle Details
                            </h3>
                            <button
                                onClick={closeEditModal}
                                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSaveVehicleModal} className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                    Vehicle Model
                                </label>
                                <input
                                    type="text"
                                    value={editModel}
                                    onChange={(e) => setEditModel(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                    Vehicle Registration Number
                                </label>
                                <input
                                    type="text"
                                    value={editVehicleNumber}
                                    onChange={(e) => setEditVehicleNumber(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none font-mono"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                    Capacity (kg)
                                </label>
                                <input
                                    type="number"
                                    value={editCapacity}
                                    onChange={(e) => setEditCapacity(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                    Status Vector
                                </label>
                                <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                                >
                                    <option value="AVAILABLE">Available</option>
                                    <option value="UNDER_MAINTENANCE font-mono">Under Maintenance</option>
                                    <option value="IN_SERVICE">In Service</option>
                                </select>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex gap-3 justify-end pt-4 border-t border-slate-800/80 mt-6">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {updating ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleManagement;