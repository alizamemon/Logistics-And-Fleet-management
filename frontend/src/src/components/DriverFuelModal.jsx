import React, { useState } from 'react';
import { fuelLogService } from '../services/fuelLogService';

const DriverFuelModal = ({ tripId, isOpen, onClose, onSubmitSuccess }) => {
    const [actualDistance, setActualDistance] = useState('');
    const [refueled, setRefueled] = useState(false);
    const [litersFilled, setLitersFilled] = useState('');
    const [stationName, setStationName] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await fuelLogService.submitDriverLog({
                tripId,
                actualDistance,
                refueled,
                litersFilled,
                stationName
            });

            alert("Trip Log & Fuel Details Saved Successfully!");
            onClose();
            if (onSubmitSuccess) onSubmitSuccess();
        } catch (err) {
            console.error(err);
            alert("Failed to save log. Please check server connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-white">
                <h2 className="text-lg font-bold !text-blue-400 flex items-center gap-2">
                    <span>⛽</span> Complete Trip & Fuel Log
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Actual Distance Input */}
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">
                            Actual Distance in KM
                        </label>
                        <input
                            type="number"
                            required
                            placeholder="e.g. 1250"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                            value={actualDistance}
                            onChange={(e) => setActualDistance(e.target.value)}
                        />
                    </div>

                    {/* Refuel Question Toggle */}
                    <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-xs text-slate-300">Have you filled fuel throughout the trip?</span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setRefueled(true)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                    refueled ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                                }`}
                            >
                                Yes
                            </button>
                            <button
                                type="button"
                                onClick={() => setRefueled(false)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                    !refueled ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                                }`}
                            >
                                No
                            </button>
                        </div>
                    </div>

                    {/* Conditional Fuel Fields */}
                    {refueled && (
                        <div className="space-y-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 animate-fadeIn">
                            <div>
                                <label className="text-[11px] text-slate-400 block mb-1">Fuel Station Name</label>
                                <input
                                    type="text"
                                    required={refueled}
                                    placeholder="e.g. Shell Pump, Sukkur"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                                    value={stationName}
                                    onChange={(e) => setStationName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-[11px] text-slate-400 block mb-1">Liters Filled</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required={refueled}
                                    placeholder="e.g. 45"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                                    value={litersFilled}
                                    onChange={(e) => setLitersFilled(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
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
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-xl cursor-pointer"
                        >
                            {loading ? 'Submitting...' : 'Save Log'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DriverFuelModal;