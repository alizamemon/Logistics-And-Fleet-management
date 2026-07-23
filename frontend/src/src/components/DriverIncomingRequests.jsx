import React, { useState, useEffect, useRef } from 'react';
import { shipmentService } from '../services/shipmentService';
import { locationService } from '../services/locationService';
import LocationTracking from '../components/LocationTracking.jsx';
import DriverIncidentModal from '../components/DriverIncidentModal.jsx';
import DriverFuelModal from '../components/DriverFuelModal.jsx';

const DriverIncomingRequests = ({ userId, showNotification, viewMode }) => {
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [activeTrips, setActiveTrips] = useState([]);
    const [completedTrips, setCompletedTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    const [expandedMapTripId, setExpandedMapTripId] = useState(null);

    const [selectedTripForFuel, setSelectedTripForFuel] = useState(null);
    const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);

    const [selectedTripForIncident, setSelectedTripForIncident] = useState(null);
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

    const simulationRef = useRef(null);
    const activeTripsRef = useRef(activeTrips);

    // Keep Ref updated to fix closure scope issues in setInterval
    useEffect(() => {
        activeTripsRef.current = activeTrips;
    }, [activeTrips]);

    // 💡 Robust Helper to extract trip ID properly from shipment object
    const getTripIdFromShipment = (shipment) => {
        if (!shipment) return null;
        return shipment.trip_id || shipment.tripId || shipment.trip?.id || shipment.id || null;
    };

    const loadData = async () => {
        try {
            setLoading(true);

            let requestsData = [];
            let allShipments = [];

            try {
                requestsData = await shipmentService.getDriverRequests(userId);
            } catch (err) {
                console.warn("Requests error:", err);
            }

            try {
                allShipments = await shipmentService.getDriverShipments(userId);
            } catch (err) {
                console.warn("All shipments error:", err);
            }

            const ongoing = allShipments.filter(t => {
                const s = (t.status || '').toString().trim().toUpperCase();
                return s === 'ON_GOING' || s === 'IN_TRANSIT' || s === 'ACCEPTED';
            });

            const finished = allShipments.filter(t => {
                const s = (t.status || '').toString().trim().toUpperCase();
                return s === 'DELIVERED' || s === 'COMPLETED';
            });

            setIncomingRequests(requestsData || []);
            setActiveTrips(ongoing);
            setCompletedTrips(finished);

        } catch (err) {
            console.error("Error loading dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            loadData();
        }
    }, [userId]);

    // 🛰️ DYNAMIC LIVE GPS LOCATION SIMULATION
    useEffect(() => {
        if (activeTrips.length === 0) {
            if (simulationRef.current) clearInterval(simulationRef.current);
            return;
        }

        const currentTrip = activeTrips[0];
        if (!currentTrip) return;

        const currentStatus = (currentTrip.status || '').toUpperCase();
        if (currentStatus === 'DELIVERED' || currentStatus === 'COMPLETED') {
            return;
        }

        if (simulationRef.current) {
            clearInterval(simulationRef.current);
        }

        const validTripId = getTripIdFromShipment(currentTrip);
        if (!validTripId) {
            console.warn("⚠️ Cannot start GPS Simulation: No valid Trip ID associated with shipment", currentTrip);
            return;
        }

        const startDynamicJourney = () => {
            let startCoords = { lat: 24.8607, lng: 67.0011 };
            let targetCoords = { lat: 33.6844, lng: 73.0479 }; //islamabad if city is not in dictionary

            const startCityName = currentTrip.sourceCity || 'Karachi';
            const destCityName = currentTrip.deliveryCity || 'Islamabad';  //fallback

            const cityCoordinates = {
                // Major Metros & Capital
                'karachi': { lat: 24.8607, lng: 67.0011 },
                'lahore': { lat: 31.5204, lng: 74.3587 },
                'islamabad': { lat: 33.6844, lng: 73.0479 },
                'rawalpindi': { lat: 33.5651, lng: 73.0169 },
                'faisalabad': { lat: 31.4504, lng: 73.1350 },
                'multan': { lat: 30.1575, lng: 71.5249 },
                'peshawar': { lat: 34.0151, lng: 71.5249 },
                'quetta': { lat: 30.1798, lng: 66.9750 },

                // Sindh Hubs & Transit Points
                'hyderabad': { lat: 25.3960, lng: 68.3578 },
                'khairpur': { lat: 27.5295, lng: 68.7592 },
                'sukkur': { lat: 27.7052, lng: 68.8574 },
                'moro': { lat: 26.6667, lng: 68.0000 },
                'nawabshah': { lat: 26.2483, lng: 68.4096 },
                'larkana': { lat: 27.5589, lng: 68.2120 },
                'mirpurkhas': { lat: 25.5269, lng: 69.0111 },
                'badin': { lat: 24.6559, lng: 68.8383 },
                'ghotki': { lat: 28.0044, lng: 69.3162 },

                // Punjab Hubs & Corridor Points
                'sahiwal': { lat: 30.6682, lng: 73.1014 },
                'gujranwala': { lat: 32.1617, lng: 74.1883 },
                'sialkot': { lat: 32.4945, lng: 74.5229 },
                'sargodha': { lat: 32.0836, lng: 72.6711 },
                'bahawalpur': { lat: 29.3544, lng: 71.6911 },
                'rahim yar khan': { lat: 28.4212, lng: 70.2989 },
                'rahimyar khan': { lat: 28.4212, lng: 70.2989 }, // Alias for safety
                'okara': { lat: 30.8100, lng: 73.4597 },
                'jhelum': { lat: 32.9405, lng: 73.7276 },
                'gujrat': { lat: 32.5742, lng: 74.0754 },

                // KPK & Northern Points
                'mardan': { lat: 34.1986, lng: 72.0404 },
                'abbottabad': { lat: 34.1688, lng: 73.2215 },
                'swat': { lat: 35.2227, lng: 72.4258 },
                'mingora': { lat: 34.7717, lng: 72.3600 },
                'nowshera': { lat: 34.0153, lng: 71.9747 },

                // Balochistan Points
                'gwadar': { lat: 25.1264, lng: 62.3225 },
                'hub': { lat: 24.9018, lng: 66.8833 },
                'khuzdar': { lat: 27.8164, lng: 66.6057 }
            };

            const cleanSource = startCityName.toLowerCase().trim();
            const cleanDest = destCityName.toLowerCase().trim();

            if (cityCoordinates[cleanSource]) startCoords = cityCoordinates[cleanSource];
            if (cityCoordinates[cleanDest]) targetCoords = cityCoordinates[cleanDest];

            let currentPos = { ...startCoords };

            simulationRef.current = setInterval(async () => {
                let latDiff = targetCoords.lat - currentPos.lat;
                let lngDiff = targetCoords.lng - currentPos.lng;

                let step = 0.04;

                if (Math.abs(latDiff) > step) {
                    currentPos.lat += latDiff > 0 ? step : -step;
                } else {
                    currentPos.lat = targetCoords.lat;
                }

                if (Math.abs(lngDiff) > step) {
                    currentPos.lng += lngDiff > 0 ? step : -step;
                } else {
                    currentPos.lng = targetCoords.lng;
                }

                // 📍 Dynamic Location string calculated via Geofence Helper
                const dynamicLocationName = getReadableLocation(currentPos.lat, currentPos.lng, destCityName);

                // 🚨 PAYLOAD POSTING TO BACKEND
                const payload = {
                    latitude: Number(currentPos.lat.toFixed(4)),
                    longitude: Number(currentPos.lng.toFixed(4)),
                    location: dynamicLocationName, // 👈 Human-readable string ("At Hyderabad", "Near Moro Highway", etc.)
                    timestamp: new Date().toISOString(),
                    trip: { id: Number(validTripId) }
                };

                try {
                    await locationService.pushLiveLocation(payload);
                    console.log(`📡 GPS Ping sent for Trip #${validTripId}:`, payload.location, payload.latitude, payload.longitude);
                } catch (err) {
                    console.error("❌ Location simulation ping failed:", err);
                }

                // 🏁 Destination Reached Logic
                if (Math.abs(currentPos.lat - targetCoords.lat) < 0.001 && Math.abs(currentPos.lng - targetCoords.lng) < 0.001) {
                    clearInterval(simulationRef.current);

                    // 🎯 Final Completion Ping in Database
                    const finalPayload = {
                        latitude: Number(targetCoords.lat.toFixed(4)),
                        longitude: Number(targetCoords.lng.toFixed(4)),
                        location: `Arrived at Destination (${destCityName})`, // 👈 Destination arrival mark
                        timestamp: new Date().toISOString(),
                        trip: { id: Number(validTripId) }
                    };

                    try {
                        await locationService.pushLiveLocation(finalPayload);
                    } catch (e) {
                        console.error("Final location log failed", e);
                    }

                    try {
                        if (shipmentService.updateShipmentStatus) {
                            await shipmentService.updateShipmentStatus(currentTrip.id, 'DELIVERED');
                        }

                        const updatedTrip = { ...currentTrip, status: 'DELIVERED' };

                        setActiveTrips(prev => prev.filter(t => t.id !== currentTrip.id));
                        setCompletedTrips(prev => [updatedTrip, ...prev.filter(t => t.id !== currentTrip.id)]);
                        setExpandedMapTripId(null);

                        showNotification(`🚀 Destination reached! Shipment delivered safely to ${destCityName}.`, "success");

                        setSelectedTripForFuel(validTripId);
                        setIsFuelModalOpen(true);

                    } catch (apiErr) {
                        console.error("DB status closure failed:", apiErr);
                        setActiveTrips(prev => prev.filter(t => t.id !== currentTrip.id));
                    }
                }

            }, 4000);
        };

        startDynamicJourney();

        return () => {
            if (simulationRef.current) clearInterval(simulationRef.current);
        };
    }, [activeTrips.length]);

    // 📍 Geofence Helper to map Lat/Lng to Human Readable Locations
    const getReadableLocation = (lat, lng, destCityName) => {
        // 1. City Bounding Boxes / Near Detection (Threshold ~ 0.25 degrees / ~25km)
        const CITIES = [
            { name: 'Karachi', lat: 24.8607, lng: 67.0011 },
            { name: 'Hyderabad', lat: 25.3960, lng: 68.3578 },
            { name: 'Moro', lat: 26.6667, lng: 68.0000 },
            { name: 'Khairpur', lat: 27.5295, lng: 68.7592 },
            { name: 'Sukkur', lat: 27.7052, lng: 68.8574 },
            { name: 'Multan', lat: 30.1575, lng: 71.5249 },
            { name: 'Sahiwal', lat: 30.6682, lng: 73.1014 },
            { name: 'Lahore', lat: 31.5204, lng: 74.3587 },
            { name: 'Rawalpindi', lat: 33.5651, lng: 73.0169 },
            { name: 'Islamabad', lat: 33.6844, lng: 73.0479 }
        ];

        for (let city of CITIES) {
            const latDiff = Math.abs(lat - city.lat);
            const lngDiff = Math.abs(lng - city.lng);

            // Close proximity to a city center (~15-20km range)
            if (latDiff < 0.15 && lngDiff < 0.15) {
                if (city.name.toLowerCase() === destCityName.toLowerCase()) {
                    return `Arrived at Destination (${city.name})`;
                }
                return `At ${city.name}`;
            }

            // Near outer bounds of a city (~35km range)
            if (latDiff < 0.35 && lngDiff < 0.35) {
                return `Near ${city.name} Highway`;
            }
        }

        // Default Fallback when travelling between major waypoints
        return `En Route to ${destCityName}`;
    };

    const handleDecision = async (shipmentId, action) => {
        try {
            if (action === 'ACCEPT') {
                await shipmentService.acceptShipment(shipmentId, userId);
                showNotification("Trip accepted and suitable vehicle assigned successfully! 🚚", "success");
            } else {
                await shipmentService.declineShipment(shipmentId);
                showNotification("Dispatch request declined.", "info");
            }
            loadData();
        } catch (err) {
            console.error("Decision update failed:", err);
            const errorMsg = err.response?.data || "Failed to register dispatch decision.";
            showNotification(errorMsg, "error");
        }
    };

    const toggleMap = (tripId) => {
        setExpandedMapTripId(prev => prev === tripId ? null : tripId);
    };

    const openFuelModalForTrip = (trip) => {
        const computedTripId = getTripIdFromShipment(trip);
        setSelectedTripForFuel(computedTripId);
        setIsFuelModalOpen(true);
    };

    const openIncidentModalForTrip = (trip) => {
        setSelectedTripForIncident(trip);
        setIsIncidentModalOpen(true);
    };

    return (
        <div className="space-y-10 animate-fadeIn text-white">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight !text-white">
                    {viewMode === 'REQUESTS' && 'Incoming Dispatch Requests'}
                    {viewMode === 'ACTIVE' && 'Active Trips'}
                    {viewMode === 'COMPLETED' && 'Completed History'}
                </h1>
                <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-2xl bg-slate-950/60 p-3 rounded-xl inline-block border border-slate-800/40">
                    {viewMode === 'REQUESTS' && 'Review and accept new dispatches from the operations team.'}
                    {viewMode === 'ACTIVE' && 'Track your active assignments currently in transit.'}
                    {viewMode === 'COMPLETED' && 'Review your successfully delivered shipments logs.'}
                </p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-400 text-xs animate-pulse">Checking dispatch radar...</div>
            ) : (
                <>
                    {/* SECTION 1: Active Trips */}
                    {viewMode === 'ACTIVE' && (
                        <div>
                            <h2 className="text-lg font-bold !text-white mb-4 flex items-center gap-2">
                                <span>🚙</span> Active Trips in Transit
                            </h2>
                            {activeTrips.length === 0 ? (
                                <div className="bg-slate-900/40 border border-dashed border-slate-800 p-6 rounded-2xl text-center">
                                    <p className="text-slate-500 text-xs">No active trips currently in progress. Accept a dispatch request to begin!</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {activeTrips.map((trip) => {
                                            const computedTripId = getTripIdFromShipment(trip);
                                            return (
                                                <div key={trip.id} className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 text-[9px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider border-l border-b border-emerald-500/20">
                                                        On Going 🚚
                                                    </div>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="text-slate-400 font-mono text-xs font-semibold mt-1">Shipment ID: #{trip.id} (Trip #{computedTripId})</h4>
                                                            <h3 className="text-emerald-400 font-mono font-bold text-sm">{trip.trackingNumber}</h3>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 border-t border-b border-slate-800/80 py-3 text-xs">
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-400">Destination:</span>
                                                            <span className="text-white font-bold">{trip.deliveryCity}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-400">Recipient:</span>
                                                            <span className="text-white font-medium">{trip.receiverName}</span>
                                                        </div>
                                                        <div className="flex justify-between font-mono">
                                                            <span className="text-slate-400">Weight:</span>
                                                            <span className="text-slate-300">{trip.weight} kg</span>
                                                        </div>
                                                        <div className="flex justify-between font-mono">
                                                            <span className="text-slate-400">Fare:</span>
                                                            <span className="text-emerald-400 font-bold">{trip.price} PKR</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            onClick={() => toggleMap(computedTripId)}
                                                            className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                                                        >
                                                            {expandedMapTripId === computedTripId ? '❌ Close Live Radar' : '🗺️ View Live Radar Map'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* MAP RENDER */}
                                    {expandedMapTripId && (
                                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl animate-fadeIn">
                                            <LocationTracking
                                                tripId={expandedMapTripId}
                                                destinationCity={activeTrips.find(t => getTripIdFromShipment(t) === expandedMapTripId)?.deliveryCity}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION 2: Pending Requests */}
                    {viewMode === 'REQUESTS' && (
                        <div>
                            <h2 className="text-lg font-bold !text-white mb-4 flex items-center gap-2">
                                <span>📥</span> Incoming Dispatch Requests
                            </h2>
                            {incomingRequests.length === 0 ? (
                                <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl text-center flex flex-col items-center justify-center">
                                    <span className="text-3xl">📭</span>
                                    <h3 className="text-md font-bold mt-3 text-white">No Pending Requests</h3>
                                    <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto text-center">
                                        You are currently on standby. New dispatch requests will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {incomingRequests.map((req) => (
                                        <div key={req.id} className="bg-slate-900/90 border border-violet-500/30 hover:border-violet-500/60 rounded-2xl p-6 shadow-xl transition-all flex flex-col justify-between space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-lg text-[9px] font-extrabold uppercase tracking-widest">
                                                        Incoming FIFO Request
                                                    </span>
                                                    <h4 className="text-slate-400 font-mono text-xs font-semibold mt-2">ID: #{req.id}</h4>
                                                    <h3 className="text-blue-400 font-mono font-bold text-sm">{req.trackingNumber}</h3>
                                                </div>
                                                <span className="text-2xl">📦</span>
                                            </div>

                                            <div className="space-y-2 border-t border-b border-slate-800/80 py-3 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Destination:</span>
                                                    <span className="text-white font-bold">{req.deliveryCity}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Recipient:</span>
                                                    <span className="text-white font-medium">{req.receiverName}</span>
                                                </div>
                                                <div className="flex justify-between font-mono">
                                                    <span className="text-slate-400">Weight:</span>
                                                    <span className="text-slate-300">{req.weight} kg</span>
                                                </div>
                                                <div className="flex justify-between font-mono">
                                                    <span className="text-slate-400">Est. Price:</span>
                                                    <span className="text-emerald-400 font-bold">{req.price} PKR</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleDecision(req.id, 'ACCEPT')}
                                                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg"
                                                >
                                                    Accept Ride
                                                </button>
                                                <button
                                                    onClick={() => handleDecision(req.id, 'DECLINE')}
                                                    className="flex-1 py-2 bg-red-600/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION 3: Completed Trips History */}
                    {viewMode === 'COMPLETED' && (
                        <div>
                            <h2 className="text-lg font-bold !text-white mb-4 flex items-center gap-2">
                                <span>🏁</span> Completed Trips Log
                            </h2>
                            {completedTrips.length === 0 ? (
                                <div className="bg-slate-900/40 border border-dashed border-slate-800 p-6 rounded-2xl text-center">
                                    <p className="text-slate-500 text-xs">No completed shipments found in this cycle.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {completedTrips.map((trip) => (
                                        <div key={trip.id} className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4 opacity-90 animate-fadeIn">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-slate-500 font-mono text-xs">ID: #{trip.id}</h4>
                                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                                                        Delivered ✅
                                                    </span>
                                                </div>
                                                <h3 className="text-slate-300 font-mono font-bold text-sm mt-1">{trip.trackingNumber}</h3>
                                            </div>

                                            <div className="space-y-1.5 border-t border-slate-900 pt-3 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">To City:</span>
                                                    <span className="text-slate-300 font-medium">{trip.deliveryCity}</span>
                                                </div>
                                                <div className="flex justify-between text-slate-500">
                                                    <span>Earnings:</span>
                                                    <span className="text-emerald-500 font-bold">{trip.price} PKR</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => openFuelModalForTrip(trip)}
                                                className="w-full py-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                                            >
                                                ⛽ Log Fuel & Distance
                                            </button>

                                            <button
                                                onClick={() => openIncidentModalForTrip(trip)}
                                                className="flex-1 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                                            >
                                                ⚠️ Report Incident
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            <DriverFuelModal
                tripId={selectedTripForFuel}
                isOpen={isFuelModalOpen}
                onClose={() => setIsFuelModalOpen(false)}
                onSubmitSuccess={() => {
                    showNotification("Fuel & Distance details recorded successfully!", "success");
                    loadData();
                }}
            />

            <DriverIncidentModal
                trip={selectedTripForIncident}
                isOpen={isIncidentModalOpen}
                onClose={() => setIsIncidentModalOpen(false)}
                showNotification={showNotification}
            />
        </div>
    );
};

export default DriverIncomingRequests;