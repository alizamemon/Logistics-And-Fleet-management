import React, { useState } from 'react';
import {
    Search,
    Truck,
    Package,
    CheckCircle,
    MapPin,
    Calendar,
    ShieldAlert,
    ArrowRight,
    Scale,
    User
} from 'lucide-react';
import { shipmentService } from '../services/shipmentService';
import bgImage from "../../assets/background.png";

const ShipmentTracking = () => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [shipment, setShipment] = useState(null);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!trackingNumber.trim()) return;

        setLoading(true);
        setError('');
        setShipment(null);

        try {
            const data = await shipmentService.getShipmentByTracking(trackingNumber.trim());
            setShipment(data);
        } catch (err) {
            console.error(err);
            setError("Tracking number not registered in our matrix. Please verify.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusStep = (status) => {
        switch (status) {
            case 'PENDING': return 1;
            case 'ASSIGNED':
            case 'ASSIGNED_PENDING_ACCEPTANCE':
            case 'ON_GOING': return 2;
            case 'DELIVERED': return 3;
            default: return 1;
        }
    };

    const currentStep = shipment ? getStatusStep(shipment.status) : 0;

    // 🆕 Helper function to format real database timestamps safely
    const formatTimelineDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div
            className="h-screen w-full text-slate-100 flex flex-col justify-between font-sans bg-cover bg-center bg-no-repeat relative m-0 p-0 overflow-hidden"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            {/* Background Dark Overlay */}
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] z-0"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

            {/* Header */}
            <header className="relative z-10 w-full border-b border-slate-900/80 bg-slate-950/70 backdrop-blur-md px-6 py-3 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-500/20 p-1.5 border border-blue-500/40 rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                        <Truck className="h-4 w-4 text-blue-400 animate-pulse" />
                    </div>
                    <span className="text-lg font-black tracking-wider text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                        Logix<span className="text-slate-200">Core</span>
                    </span>
                </div>
            </header>

            {/* Fluid Main Body */}
            <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto flex flex-col justify-center px-6 py-4 gap-4 overflow-hidden">

                {/* Compact Hero Section */}
                <div className="text-center space-y-1 shrink-0">
                    <h1 className="text-2xl md:text-3xl font-black !text-white tracking-tight leading-tight">
                        Locate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 drop-shadow-[0_2px_10px_rgba(99,102,241,0.2)]">Shipment</span>
                    </h1>
                    <p className="text-slate-400 text-[11px] max-w-md mx-auto">
                        Input your unique terminal tracking ID below to fetch active coordinates.
                    </p>
                </div>

                {/* Grid Layout Locked */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch overflow-hidden max-h-[72vh]">

                    <div className="lg:col-span-5 bg-gradient-to-b from-slate-900/70 to-slate-950/70 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-4">
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-sm font-extrabold !text-blue-100 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                                    Terminal Search
                                </h2>
                                <p className="text-[10px] text-slate-500 mt-0.5">Provide the routing ID printed on your invoice.</p>
                            </div>

                            <form onSubmit={handleTrack} className="space-y-3">
                                <div className="relative flex items-center">
                                    <Search className="absolute left-3 text-blue-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Enter Tracking ID (e.g., LGC-990022)"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        className="bg-slate-950/95 border border-slate-800 focus:border-blue-400/80 w-full pl-10 pr-3 py-2.5 rounded-xl text-xs text-slate-100 focus:outline-none transition-all placeholder:text-slate-600 focus:shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-blue-500/10 hover:shadow-indigo-500/30 flex items-center justify-center gap-1.5"
                                >
                                    {loading ? 'Querying Database...' : (
                                        <>
                                            <span>Initiate Tracker</span>
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Informational Sub-card */}
                        <div className="border-t border-slate-800/60 pt-4 space-y-3 text-[11px] text-slate-400">
                            <div className="flex gap-2.5 items-start">
                                <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 p-1.5 rounded-lg shrink-0 border border-blue-500/20">
                                    <MapPin className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-300">Hub Network Coverage</h4>
                                    <p className="text-slate-500 text-[10px] mt-0.5">Real-time localized mapping across the entire metropolitan coordinates.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL (Dynamic Tracker Details) */}
                    <div className="lg:col-span-7 w-full flex flex-col justify-stretch overflow-hidden">
                        {error && (
                            <div className="bg-red-500/5 border border-red-500/30 p-5 rounded-2xl flex items-start gap-3 h-full animate-fade-in shadow-[0_0_20px_rgba(239,68,68,0.05)]">
                                <ShieldAlert className="h-5 w-5 text-red-400 shrink-0" />
                                <div>
                                    <h4 className="text-xs font-bold text-red-400">Network Database Exception</h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5">{error}</p>
                                </div>
                            </div>
                        )}

                        {!shipment && !error && (
                            <div className="bg-slate-900/20 border border-indigo-500/20 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full shadow-[inset_0_0_30px_rgba(99,102,241,0.05)]">
                                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-3.5 rounded-full border border-blue-500/20 mb-3 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                                    <Truck className="h-6 w-6 text-indigo-400 animate-bounce" />
                                </div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Standing By</h3>
                                <p className="text-[10px] text-slate-600 max-w-xs mt-1">Awaiting tracking request. Active data will materialize right here.</p>
                            </div>
                        )}

                        {shipment && (
                            <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-xl shadow-2xl flex flex-col justify-between h-full animate-fade-in">

                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                                        <div className="space-y-0.5">
                                            <span className="text-[8px] text-indigo-400 uppercase tracking-widest font-black">LOGIXCORE REGISTERED</span>
                                            <h3 className="text-base font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.2)]">
                                                {shipment.trackingNumber}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[8px] text-slate-500 font-bold">SYSTEM STATUS:</span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                                                currentStep === 3
                                                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/10'
                                                    : currentStep === 2
                                                        ? 'text-blue-400 bg-blue-500/10 border-blue-500/30 shadow-blue-500/10'
                                                        : 'text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-amber-500/10'
                                            }`}>
                                                {currentStep === 3 ? 'Delivered' : currentStep === 2 ? 'Dispatched' : 'Confirmed'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stepper (Sleek Glow Heights) */}
                                    <div className="relative py-2">
                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-950 -translate-y-1/2 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                                style={{ width: `${currentStep === 1 ? '10%' : currentStep === 2 ? '50%' : '100%'}` }}
                                            />
                                        </div>

                                        <div
                                            className="absolute -top-2 transition-all duration-1000 ease-out z-10 hidden sm:block"
                                            style={{
                                                left: `${currentStep === 1 ? 'calc(10% - 14px)' : currentStep === 2 ? 'calc(50% - 14px)' : 'calc(100% - 14px)'}`,
                                            }}
                                        >
                                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-slate-950 p-1 rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.5)] border border-blue-300">
                                                <Truck className="h-3 w-3 text-white" />
                                            </div>
                                        </div>

                                        <div className="relative flex justify-between items-center z-10">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-7.5 h-7.5 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                                                    currentStep >= 1 ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)]' : 'bg-slate-950 text-slate-600 border-slate-900'
                                                }`}>
                                                    <Package className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="text-[8px] font-black text-slate-300 mt-1 uppercase">Booked</span>
                                            </div>

                                            <div className="flex flex-col items-center">
                                                <div className={`w-7.5 h-7.5 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                                                    currentStep >= 2 ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-400 shadow-[0_0_12px_rgba(99,102,241,0.3)]' : 'bg-slate-950 text-slate-600 border-slate-900'
                                                }`}>
                                                    <Truck className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="text-[8px] font-black text-slate-300 mt-1 uppercase">Dispatched</span>
                                            </div>

                                            <div className="flex flex-col items-center">
                                                <div className={`w-7.5 h-7.5 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                                                    currentStep === 3 ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-slate-950 text-slate-600 border-slate-900'
                                                }`}>
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="text-[8px] font-black text-slate-300 mt-1 uppercase">Delivered</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 🆕 Real-Time Activity Log Timeline Section */}
                                    <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl shadow-inner space-y-3">
                                        <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                            <Calendar className="h-3.5 w-3.5 text-blue-400" /> Real-time Activity Log
                                        </h4>

                                        <div className="space-y-3 relative border-l border-slate-800 ml-1.5 pl-3.5 text-[10px]">
                                            {/* Step 1: Booked (Uses baseline createdAt) */}
                                            <div className="relative">
                                                <span className={`absolute -left-[19px] top-0.5 w-2 h-2 rounded-full ${currentStep >= 1 ? 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-slate-800'}`}></span>
                                                <div className="flex justify-between items-start">
                                                    <span className={`font-semibold ${currentStep >= 1 ? 'text-slate-200' : 'text-slate-500'}`}>Parcel Booked & Confirmed</span>
                                                    <span className="text-slate-500 font-mono text-[9px]">
                                                        {shipment.createdAt ? formatTimelineDate(shipment.createdAt) : 'N/A'}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-[9px] mt-0.5">Order registered securely in the logistics framework matrix.</p>
                                            </div>

                                            {/* Step 2: Dispatched (Uses dynamic dispatchedAt) */}
                                            <div className="relative">
                                                <span className={`absolute -left-[19px] top-0.5 w-2 h-2 rounded-full ${currentStep >= 2 ? 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-800'}`}></span>
                                                <div className="flex justify-between items-start">
                                                    <span className={`font-semibold ${currentStep >= 2 ? 'text-slate-200' : 'text-slate-500'}`}>Dispatched from Fulfillment Center</span>
                                                    <span className="text-slate-500 font-mono text-[9px]">
                                                        {shipment.dispatchedAt ? formatTimelineDate(shipment.dispatchedAt) : 'Awaiting Dispatch'}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-[9px] mt-0.5">
                                                    {shipment.dispatchedAt
                                                        ? `Package handed over to carrier fleet driver: ${shipment.driver?.fullName || 'Assigned Courier'}`
                                                        : 'Awaiting parcel sortation and dispatch release.'}
                                                </p>
                                            </div>

                                            {/* Step 3: Delivered (Uses dynamic deliveredAt) */}
                                            <div className="relative">
                                                <span className={`absolute -left-[19px] top-0.5 w-2 h-2 rounded-full ${currentStep === 3 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-800'}`}></span>
                                                <div className="flex justify-between items-start">
                                                    <span className={`font-semibold ${currentStep === 3 ? 'text-slate-200' : 'text-slate-500'}`}>Delivered Safe & Sound</span>
                                                    <span className="text-slate-500 font-mono text-[9px]">
                                                        {shipment.deliveredAt ? formatTimelineDate(shipment.deliveredAt) : 'Pending Delivery'}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-[9px] mt-0.5">
                                                    {shipment.deliveredAt ? 'Handed over securely to the registered receiver.' : 'Out for delivery to destination.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Metrics */}
                                <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-800/80 text-[10px]">
                                    <div className="bg-gradient-to-b from-slate-950/40 to-slate-950/80 p-2 rounded-lg border border-slate-800/60 flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                        <div>
                                            <span className="text-slate-500 uppercase block text-[7px] font-bold">Destination</span>
                                            <span className="text-slate-300 font-bold">{shipment.deliveryCity}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-b from-slate-950/40 to-slate-950/80 p-2 rounded-lg border border-slate-800/60 flex items-center gap-2">
                                        <Scale className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                                        <div>
                                            <span className="text-slate-500 uppercase block text-[7px] font-bold">Total Weight</span>
                                            <span className="text-slate-300 font-bold">{shipment.weight} KG</span>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-b from-slate-950/40 to-slate-950/80 p-2 rounded-lg border border-slate-800/60 flex items-center gap-2">
                                        <User className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                                        <div>
                                            <span className="text-slate-500 uppercase block text-[7px] font-bold">Receiver</span>
                                            <span className="text-slate-300 font-bold truncate max-w-[80px] block">{shipment.receiverName}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 w-full border-t border-slate-900/60 bg-slate-950/90 backdrop-blur-md py-3 text-center text-[9px] text-slate-600 shrink-0">
                &copy; {new Date().getFullYear()} LogixCore Systems. All operations protected under standard payload cryptography.
            </footer>
        </div>
    );
};

export default ShipmentTracking;