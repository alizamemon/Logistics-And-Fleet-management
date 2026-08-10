import React, { useState, useEffect } from 'react';
import { driverService } from '../services/driverService';
import { UserCheck, RefreshCw, Edit2, Trash2, X } from 'lucide-react';

const DriverManagement = ({ currentUser, showNotification }) => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const isAdmin = currentUser?.role === 'ADMIN';

    // Edit modal states (Only for Admin to interact)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState({ id: '', licenseNumber: '', phone: '', status: '' });
    const [updating, setUpdating] = useState(false);

    const loadDrivers = async () => {
        try {
            setLoading(true);
            const data = await driverService.getAllDrivers();
            setDrivers(data || []);
        } catch (err) {
            console.error("Error fetching drivers:", err);
            showNotification("Failed to fetch drivers data.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDrivers();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to remove this driver profile?")) {
            try {
                await driverService.deleteDriver(id);
                showNotification("Driver profile deleted successfully.", "success");
                loadDrivers();
            } catch (err) {
                showNotification("Failed to delete driver.", "error");
            }
        }
    };

    const openEditModal = (driver) => {
        setEditingDriver({
            id: driver.id,
            licenseNumber: driver.licenseNumber,
            phone: driver.phone,
            status: driver.status || 'AVAILABLE'
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            setUpdating(true);
            await driverService.updateDriver(editingDriver.id, editingDriver);
            showNotification("Driver profile updated.", "success");
            setIsEditModalOpen(false);
            loadDrivers();
        } catch (err) {
            showNotification("Failed to update driver parameters.", "error");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-fadeIn">
            {/* Standardized Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-800/80 gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        <span>👤</span> Driver Management
                    </h1>
                    <p className="text-slate-400 text-xs mt-1">
                        {isAdmin ? "Admin view: Edit, update or delete drivers." : "Employee view: Directory of registered fleet drivers."}
                    </p>
                </div>
                <button
                    onClick={loadDrivers}
                    className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
            </div>

            {/* Drivers Registry Table Container */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                <div className="p-4 md:p-6 border-b border-slate-800/80 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Drivers Registry</h3>
                </div>

                {loading ? (
                    <div className="p-16 text-center text-slate-400 font-medium animate-pulse text-xs md:text-sm">
                        Syncing driver records...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-800/80 text-slate-300 text-xs font-bold tracking-wider uppercase border-b border-slate-800">
                            <tr>
                                <th className="py-4 px-6 font-bold">ID</th>
                                <th className="py-4 px-6 font-bold">Driver Name</th>
                                <th className="py-4 px-6 font-bold">License Number</th>
                                <th className="py-4 px-6 font-bold">Phone</th>
                                <th className="py-4 px-6 font-bold">Status</th>
                                {isAdmin && <th className="py-4 px-6 font-bold text-center">Actions</th>}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 text-sm text-gray-200 bg-black/10">
                            {drivers.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 6 : 5} className="p-12 text-center text-slate-500 text-xs">
                                        No driver profiles registered.
                                    </td>
                                </tr>
                            ) : (
                                drivers.map((driver) => (
                                    <tr key={driver.id} className="hover:bg-slate-800/30 transition-all">
                                        <td className="py-4 px-6 font-mono text-slate-500 text-xs">#{driver.id}</td>
                                        <td className="py-4 px-6 font-bold text-white">{driver.user?.fullName || 'N/A'}</td>
                                        <td className="py-4 px-6 font-mono text-xs text-slate-300">{driver.licenseNumber}</td>
                                        <td className="py-4 px-6 text-slate-300">{driver.phone}</td>
                                        <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    driver.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                                                        driver.status === 'BUSY' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                                                            'bg-red-500/10 text-red-400 border border-red-500/30'
                                                }`}>
                                                    {driver.status || 'AVAILABLE'}
                                                </span>
                                        </td>
                                        {isAdmin && (
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(driver)}
                                                        className="p-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer hover:bg-slate-700 transition-all"
                                                        title="Edit Driver Details"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(driver.id)}
                                                        className="p-1.5 bg-red-600/10 text-red-400 border border-red-500/20 rounded-xl text-xs cursor-pointer hover:bg-red-600/20 transition-all"
                                                        title="Delete Driver"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Standard Global Modal Overlay */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto">

                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-slate-950/40">
                            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-blue-400" /> Modify Driver Details
                            </h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                    License Number
                                </label>
                                <input
                                    type="text"
                                    value={editingDriver.licenseNumber}
                                    onChange={(e) => setEditingDriver({ ...editingDriver, licenseNumber: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none font-mono"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                    Phone Contact
                                </label>
                                <input
                                    type="text"
                                    value={editingDriver.phone}
                                    onChange={(e) => setEditingDriver({ ...editingDriver, phone: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                    Status Vector
                                </label>
                                <select
                                    value={editingDriver.status}
                                    onChange={(e) => setEditingDriver({ ...editingDriver, status: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                                >
                                    <option value="AVAILABLE">Available</option>
                                    <option value="BUSY">Busy</option>
                                    <option value="OFF_DUTY">Off Duty</option>
                                </select>
                            </div>

                            {/* Modal Action Buttons */}
                            <div className="flex gap-3 justify-end pt-4 border-t border-slate-800/80 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
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

export default DriverManagement;