import React, { useState, useEffect } from 'react';
import { driverService } from '../services/driverService';

const DriverManagement = ({ currentUser, showNotification }) => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const isAdmin = currentUser?.role === 'ADMIN';

    // Edit modal states (Only for Admin to interact)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState({ id: '', licenseNumber: '', phone: '', status: '' });

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
            await driverService.updateDriver(editingDriver.id, editingDriver);
            showNotification("Driver profile updated.", "success");
            setIsEditModalOpen(false);
            loadDrivers();
        } catch (err) {
            showNotification("Failed to update driver parameters.", "error");
        }
    };

    return (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md p-6 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                    <h2 className="text-xl font-bold !text-white tracking-tight">Active Drivers Registry</h2>
                    <p className="text-slate-400 text-xs mt-1">
                        {isAdmin ? "Admin view: Edit, update or delete drivers." : "Employee view: Directory of registered fleet drivers."}
                    </p>
                </div>
                <button onClick={loadDrivers} className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer">
                    🔄 Refresh
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-400 text-xs animate-pulse">Syncing driver records...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-800/80 text-slate-300 text-xs font-bold tracking-wider uppercase border-b border-slate-800">
                        <tr>
                            <th className="py-4 px-4 pl-6">ID</th>
                            <th className="py-4 px-4">Driver Name</th>
                            <th className="py-4 px-4">License Number</th>
                            <th className="py-4 px-4">Phone</th>
                            <th className="py-4 px-4">Status</th>
                            {isAdmin && <th className="py-4 px-6 text-center">Actions</th>}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 text-sm text-gray-200 bg-black/10">
                        {drivers.length === 0 ? (
                            <tr>
                                <td colSpan={isAdmin ? 6 : 5} className="p-10 text-center text-slate-500">No driver profiles registered.</td>
                            </tr>
                        ) : (
                            drivers.map((driver) => (
                                <tr key={driver.id} className="hover:bg-slate-800/30 transition-all">
                                    <td className="py-4 px-4 pl-6 font-mono text-slate-500 text-xs">#{driver.id}</td>
                                    <td className="py-4 px-4 font-bold text-white">{driver.user?.fullName || 'N/A'}</td>
                                    <td className="py-4 px-4 font-mono text-xs">{driver.licenseNumber}</td>
                                    <td className="py-4 px-4 text-slate-300">{driver.phone}</td>
                                    <td className="py-4 px-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                                driver.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                                    driver.status === 'BUSY' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                                        'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}>
                                                {driver.status || 'AVAILABLE'}
                                            </span>
                                    </td>
                                    {isAdmin && (
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => openEditModal(driver)} className="p-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer">✏️</button>
                                                <button onClick={() => handleDelete(driver.id)} className="p-1.5 bg-red-600/10 text-red-400 border border-red-500/20 rounded-xl text-xs cursor-pointer">🗑️</button>
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

            {/* Edit Driver Modal (Visible/Modifiable only by Admin) */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="text-lg font-bold text-white">Modify Driver Details</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white text-sm cursor-pointer">✕</button>
                        </div>
                        <form onSubmit={handleUpdateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">License Number</label>
                                <input
                                    type="text"
                                    value={editingDriver.licenseNumber}
                                    onChange={(e) => setEditingDriver({ ...editingDriver, licenseNumber: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Phone Contact</label>
                                <input
                                    type="text"
                                    value={editingDriver.phone}
                                    onChange={(e) => setEditingDriver({ ...editingDriver, phone: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Status Vector</label>
                                <select
                                    value={editingDriver.status}
                                    onChange={(e) => setEditingDriver({ ...editingDriver, status: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="AVAILABLE">Available</option>
                                    <option value="BUSY">Busy</option>
                                    <option value="OFF_DUTY">Off Duty</option>
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 cursor-pointer">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverManagement;