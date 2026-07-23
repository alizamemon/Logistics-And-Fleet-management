import React, { useState } from 'react';
import { customerService } from '../services/customerService';
import { shipmentService } from '../services/shipmentService';

const BookingDesk = ({ showNotification }) => {
    const [customerPhone, setCustomerPhone] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isExistingCustomer, setIsExistingCustomer] = useState(false);
    const [isJustRegistered, setIsJustRegistered] = useState(false);

    const [customerData, setCustomerData] = useState({
        id: null,
        fullName: '',
        email: '',
        address: '',
        phone: ''
    });

    // 🎯 Fix 1: estimatedDistance ko shipmentData mein add kar dia hai
    const [shipmentData, setShipmentData] = useState({
        receiverName: '',
        receiverPhone: '',
        deliveryCity: '',
        weight: '',
        price: '',
        estimatedDistance: ''
    });

    const handleCustomerSearch = async () => {
        if (!customerPhone.trim()) {
            if (showNotification) showNotification("Please enter a phone number.", "error");
            return;
        }

        setIsSearching(true);
        setIsJustRegistered(false);
        try {
            console.log("Searching customer with phone:", customerPhone);
            const data = await customerService.getCustomerByPhone(customerPhone);
            console.log("Customer found:", data);

            setCustomerData({
                id: data.id,
                fullName: data.fullName,
                email: data.email || '',
                address: data.address,
                phone: data.phone
            });
            setIsExistingCustomer(true);
            if (showNotification) showNotification("Client match localized. Profile loaded.", "success");
        } catch (error) {
            console.error("Search error:", error);
            resetCustomerFields(true);
            setCustomerData(prev => ({ ...prev, phone: customerPhone }));
            if (showNotification) showNotification("No client match found. Enter details manually.", "error");
        } finally {
            setIsSearching(false);
        }
    };

    const resetCustomerFields = (keepPhone = false) => {
        setIsExistingCustomer(false);
        setIsJustRegistered(false);
        setCustomerData({ id: null, fullName: '', email: '', address: '', phone: keepPhone ? customerPhone : '' });
        if (!keepPhone) setCustomerPhone('');
    };

    const resetFormAll = () => {
        resetCustomerFields(false);
        setShipmentData({
            receiverName: '',
            receiverPhone: '',
            deliveryCity: '',
            weight: '',
            price: '',
            estimatedDistance: ''
        });
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submission triggered!");

        try {
            let finalCustomerId = customerData.id;

            // Step A: Register new customer if not found previously
            if (!isExistingCustomer) {
                console.log("Customer does not exist. Creating dynamic customer node...");
                const customerPayload = {
                    fullName: customerData.fullName,
                    phone: customerData.phone || customerPhone,
                    email: customerData.email || null,
                    address: customerData.address
                };

                const savedCustomer = await customerService.registerCustomer(customerPayload);
                console.log("Saved Customer Response:", savedCustomer);
                finalCustomerId = savedCustomer.id;

                setIsJustRegistered(true);
                if (showNotification) {
                    showNotification(`New Client [${savedCustomer.fullName}] Registered Successfully!`, "success");
                }
            }

            // Step B: Book shipment (🎯 Fix 2: estimatedDistance bhi payload mein bhej rahe hain)
            const shipmentPayload = {
                receiverName: shipmentData.receiverName,
                receiverPhone: shipmentData.receiverPhone,
                deliveryCity: shipmentData.deliveryCity,
                weight: parseFloat(shipmentData.weight),
                price: parseFloat(shipmentData.price),
                estimatedDistance: parseFloat(shipmentData.estimatedDistance),
                customer: {
                    id: finalCustomerId
                }
            };

            console.log("Sending Shipment Payload:", shipmentPayload);
            const bookedShipment = await shipmentService.createShipment(shipmentPayload);
            console.log("Shipment successfully booked:", bookedShipment);

            if (showNotification) {
                showNotification(`Order dispatched! Tracking assigned: ${bookedShipment.trackingNumber}`, "success");
            } else {
                alert(`Order Dispatched! Tracking: ${bookedShipment.trackingNumber}`);
            }
            resetFormAll();

        } catch (error) {
            console.error("Critical failure during shipment processing:", error);
            if (showNotification) {
                showNotification(error.response?.data?.message || "Execution matrix failure. Please check backend log.", "error");
            } else {
                alert("Booking process failed!");
            }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left Panel: Customer Profile */}
            <div className={`lg:col-span-5 bg-slate-900/80 border p-5 rounded-2xl shadow-xl transition-all duration-300 ${
                isExistingCustomer
                    ? 'border-blue-500/50 shadow-blue-500/5'
                    : isJustRegistered
                        ? 'border-emerald-500 shadow-emerald-500/10'
                        : 'border-slate-800'
            }`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest">1. Sender / Client Verification</h3>
                    {isExistingCustomer && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">PROFILE LOADED</span>
                    )}
                    {isJustRegistered && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">CLIENT REGISTERED</span>
                    )}
                </div>

                <div className="space-y-3 mb-6">
                    <label className="text-slate-400 text-xs">Search Client Phone</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="e.g. 02199887766"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            disabled={isExistingCustomer || isJustRegistered}
                            className="bg-slate-950/60 border border-slate-800 px-4 py-2 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500 flex-1"
                        />
                        {isExistingCustomer || isJustRegistered ? (
                            <button type="button" onClick={() => resetCustomerFields(false)} className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-3 py-2 rounded-xl text-xs font-bold transition-all">Clear</button>
                        ) : (
                            <button type="button" onClick={handleCustomerSearch} disabled={isSearching} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">
                                {isSearching ? "..." : "Scan"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">Client Full Name</label>
                        <input
                            type="text"
                            required
                            disabled={isExistingCustomer || isJustRegistered}
                            value={customerData.fullName}
                            onChange={(e) => setCustomerData({...customerData, fullName: e.target.value})}
                            className="bg-slate-950/40 border border-slate-800/80 w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 disabled:opacity-50 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">Email Reference</label>
                        <input
                            type="email"
                            disabled={isExistingCustomer || isJustRegistered}
                            value={customerData.email}
                            onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                            className="bg-slate-950/40 border border-slate-800/80 w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 disabled:opacity-50 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">Physical Address</label>
                        <textarea
                            rows="2"
                            required
                            disabled={isExistingCustomer || isJustRegistered}
                            value={customerData.address}
                            onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                            className="bg-slate-950/40 border border-slate-800/80 w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 disabled:opacity-50 focus:outline-none resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">Phone Number</label>
                        <input
                            type="text"
                            required
                            disabled={isExistingCustomer || isJustRegistered}
                            value={customerData.phone}
                            onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                            className="bg-slate-950/40 border border-slate-800/80 w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 disabled:opacity-50 focus:outline-none resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Right Panel: Shipment inputs */}
            <form onSubmit={handleBookingSubmit} className="lg:col-span-7 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">2. Destination & Package Specifications</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">Receiver Name</label>
                            <input
                                type="text"
                                required
                                value={shipmentData.receiverName}
                                onChange={(e) => setShipmentData({...shipmentData, receiverName: e.target.value})}
                                className="bg-slate-950/40 border border-slate-800/80 w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">Receiver Phone</label>
                            <input
                                type="text"
                                required
                                value={shipmentData.receiverPhone}
                                onChange={(e) => setShipmentData({...shipmentData, receiverPhone: e.target.value})}
                                className="bg-slate-950/40 border border-slate-800/80 w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">Delivery Destination City</label>
                            <input
                                type="text"
                                required
                                value={shipmentData.deliveryCity}
                                onChange={(e) => setShipmentData({...shipmentData, deliveryCity: e.target.value})}
                                className="bg-slate-950/40 border border-slate-800/80 w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">Cargo Weight (KG)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={shipmentData.weight}
                                onChange={(e) => setShipmentData({...shipmentData, weight: e.target.value})}
                                className="bg-slate-950/40 border border-slate-800/80 w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">Charge Price (PKR)</label>
                            <input
                                type="number"
                                required
                                value={shipmentData.price}
                                onChange={(e) => setShipmentData({...shipmentData, price: e.target.value})}
                                className="bg-slate-950/40 border border-slate-800/80 w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* 🎯 Fix 3: Updated to use shipmentData instead of undefined bookingData */}
                        <div>
                            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">Estimated Distance (KM)</label>
                            <input
                                type="number"
                                required
                                placeholder="e.g. 1200"
                                className="bg-slate-950/40 border border-slate-800/80 w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                                value={shipmentData.estimatedDistance}
                                onChange={(e) => setShipmentData({ ...shipmentData, estimatedDistance: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/60 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={resetFormAll}
                        className="px-4 py-2.5 border border-slate-800 hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
                    >
                        Reset Matrix
                    </button>
                    <button
                        type="submit"
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                    >
                        Book & Lock Shipment
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookingDesk;