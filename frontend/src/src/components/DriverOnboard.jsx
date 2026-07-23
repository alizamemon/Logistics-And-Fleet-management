import React, { useState, useEffect } from 'react';
import { driverService } from '../services/driverService';
import { Truck, AlertTriangle } from 'lucide-react';

const DriverOnboard = ({ currentUser, showNotification }) => {
    const [driverProfile, setDriverProfile] = useState(null);
    const [licenseNumber, setLicenseNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDriverData = async () => {
            try {
                setLoading(true);
                const data = await driverService.getDriverByUserId(currentUser.id);
                setDriverProfile(data);
            } catch (err) {
                console.error("Failed to fetch driver profile data", err);
                showNotification("Could not retrieve driver status logs.", "error");
            } finally {
                setLoading(false);
            }
        };

        if (currentUser?.id) {
            fetchDriverData();
        }
    }, [currentUser?.id]);

    // 2. Submit onboarding form
    const handleOnboardSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const updatedProfile = await driverService.onboardDriver(
                currentUser.id,
                licenseNumber,
                phone
            );
            setDriverProfile(updatedProfile);
            showNotification("Profile verified! You are now marked as AVAILABLE for trips.", "success");
        } catch (err) {
            console.error("Onboarding failed:", err);
            showNotification("Failed to patch driver credentials.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !driverProfile) {
        return (
            <div className="p-16 text-center text-slate-400 font-medium animate-pulse text-xs">
                Syncing driver telemetry...
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Onboarding State: INCOMPLETE */}
            {driverProfile && driverProfile.status === 'INCOMPLETE' ? (
                <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-slate-800 p-6 rounded-2xl max-w-md mx-auto shadow-2xl backdrop-blur-xl">
                    <div className="space-y-4">
                        <div className="border-b border-slate-800/80 pb-3">
                            <span className="text-[8px] text-amber-400 uppercase tracking-widest font-black flex items-center gap-1.5">
                                <AlertTriangle className="h-3 w-3 text-amber-400 animate-pulse" /> ACTION REQUIRED
                            </span>
                            <h3 className="text-lg font-extrabold text-slate-100 tracking-tight mt-1">Activate Driver Account</h3>
                            <p className="text-[11px] text-slate-400 mt-1">
                                Complete your registration details to start receiving trips.
                            </p>
                        </div>

                        <form onSubmit={handleOnboardSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">License Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g., LGC-DL-7729"
                                    value={licenseNumber}
                                    onChange={(e) => setLicenseNumber(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 focus:border-blue-400 w-full px-3.5 py-2.5 rounded-xl text-xs text-slate-100 focus:outline-none transition-all placeholder:text-slate-700"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g., +92 312 3456789"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 focus:border-blue-400 w-full px-3.5 py-2.5 rounded-xl text-xs text-slate-100 focus:outline-none transition-all placeholder:text-slate-700"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-blue-500/10 disabled:opacity-55"
                            >
                                {loading ? "Updating profile..." : "Complete Registration & Go Available"}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                /* Active / Available State: Render Assigned Trips */
                    <p className="text-[10px] text-slate-600 mt-1 max-w-l mx-auto">
                        Your account is ACTIVE and ready. Upcoming dispatch manifests will appear here in real-time.
                    </p>
            )}
        </div>
    );
};

export default DriverOnboard;