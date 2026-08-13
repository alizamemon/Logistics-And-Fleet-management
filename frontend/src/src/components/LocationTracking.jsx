import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import API from '../services/api';
import 'leaflet/dist/leaflet.css';

// 🛑 Leaflet Default Asset Fix
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
});

// 🚚 Fallback Truck SVG (Data URL) agar Backend se Blop na mile
const defaultTruckSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2338bdf8"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`;

// 🎨 Custom Base64 / SVG / Image Marker Generator
const createCustomTruckIcon = (blop) => {
    let imgSrc = (blop && typeof blop === 'string' && blop.trim().length > 10)
        ? blop.trim()
        : defaultTruckSvg;

    if (!imgSrc.startsWith('data:') && !imgSrc.startsWith('http')) {
        imgSrc = `data:image/svg+xml;base64,${imgSrc}`;
    }

    return L.divIcon({
        className: 'custom-vehicle-marker-wrapper',
        html: `
            <div style="
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: #0f172a;
                border: 3px solid #38bdf8;
                box-shadow: 0 4px 14px rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                padding: 6px;
                box-sizing: border-box;
            ">
                <img src="${imgSrc}" style="width: 100%; height: 100%; object-fit: contain; display: block;" alt="Vehicle" />
            </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
        popupAnchor: [0, -24]
    });
};

// 🟢 Starting / Origin Hub Marker Icon (Green Circle with Flag 🚩)
const originIcon = L.divIcon({
    className: 'custom-origin-marker',
    html: `
        <div style="
            background-color: #10b981; 
            width: 38px; 
            height: 38px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 0 14px rgba(16, 185, 129, 0.9);
            border: 3px solid #ffffff;
            font-size: 20px;
        ">
            🚩
        </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19]
});

// 🏁 Destination Marker Icon (Red Circle with Finish Flag 🏁)
const destinationIcon = L.divIcon({
    className: 'custom-destination-marker',
    html: `
        <div style="
            background-color: #ef4444; 
            width: 38px; 
            height: 38px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 0 14px rgba(239, 68, 68, 0.9);
            border: 3px solid #ffffff;
            font-size: 20px;
        ">
            🏁
        </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19]
});

// 📍 City Coordinates Dictionary
const CITY_COORDINATES = {
    'karachi': [24.8607, 67.0011],
    'lahore': [31.5204, 74.3587],
    'islamabad': [33.6844, 73.0479],
    'rawalpindi': [33.5651, 73.0169],
    'faisalabad': [31.4504, 73.1350],
    'multan': [30.1575, 71.5249],
    'peshawar': [34.0151, 71.5249],
    'quetta': [30.1798, 66.9750],
    'hyderabad': [25.3960, 68.3578],
    'khairpur': [27.5295, 68.7592],
    'sukkur': [27.7052, 68.8574],
    'moro': [26.6667, 68.0000],
    'nawabshah': [26.2483, 68.4096],
    'larkana': [27.5589, 68.2120],
    'sahiwal': [30.6682, 73.1014],
    'gujranwala': [32.1617, 74.1883],
    'sialkot': [32.4945, 74.5229],
    'sargodha': [32.0836, 72.6711],
    'bahawalpur': [29.3544, 71.6911],
    'rahim yar khan': [28.4212, 70.2989],
    'rahimyar khan': [28.4212, 70.2989]
};

// ✴ Dynamic Target Focus Button Component
const RecenterButton = ({ location }) => {
    const map = useMap();

    const handleRecenter = () => {
        if (location && Array.isArray(location) && location.length === 2) {
            // Smoothly fly to current vehicle location and set zoom to level 14
            map.flyTo(location, 14, {
                animate: true,
                duration: 1.5
            });
        }
    };

    return (
        <div className="leaflet-top leaflet-right" style={{ marginTop: '12px', marginRight: '12px', zIndex: 1000 }}>
            <button
                type="button"
                onClick={handleRecenter}
                title="Focus Active Vehicle Location"
                className="bg-slate-900/90 hover:bg-slate-800 text-amber-400 p-2.5 rounded-full border border-slate-700/80 shadow-2xl backdrop-blur-md flex items-center justify-center transition-all active:scale-90 cursor-pointer text-xl leading-none"
            >
                ✴
            </button>
        </div>
    );
};

const LocationTracking = ({ tripId, sourceCity = "Karachi", destinationCity = "" }) => {
    const [positions, setPositions] = useState([]);
    const [latestLocationDetails, setLatestLocationDetails] = useState(null);
    const [vehicleBlop, setVehicleBlop] = useState(null);
    const [loading, setLoading] = useState(true);

    const cleanSourceCity = (sourceCity || 'karachi').toLowerCase().trim();
    const cleanDestCity = (destinationCity || '').toLowerCase().trim();

    const originCoords = positions.length > 0 ? positions[0] : (CITY_COORDINATES[cleanSourceCity] || CITY_COORDINATES['karachi']);
    const destinationCoords = CITY_COORDINATES[cleanDestCity] || CITY_COORDINATES['islamabad'];

    const getLocationText = (locationObj) => {
        if (!locationObj) return 'En Route via Highway';
        return (
            locationObj.location ||
            locationObj.locationName ||
            locationObj.address ||
            `Lat: ${Number(locationObj.latitude)?.toFixed(3)}, Lng: ${Number(locationObj.longitude)?.toFixed(3)}`
        );
    };

    const fetchLocationHistory = async () => {
        if (!tripId) {
            setLoading(false);
            return;
        }
        try {
            const response = await API.get(`/location-history/trip/${tripId}`);
            if (response && Array.isArray(response.data) && response.data.length > 0) {
                const validCoordinates = response.data
                    .filter(loc => loc && loc.latitude != null && loc.longitude != null)
                    .map(loc => [Number(loc.latitude), Number(loc.longitude)]);

                if (validCoordinates.length > 0) {
                    setPositions(validCoordinates);
                    const latest = response.data[response.data.length - 1];
                    setLatestLocationDetails(latest);

                    const extractedBlop =
                        latest?.trip?.vehicle?.blop ||
                        latest?.trip?.vehicle?.blob ||
                        latest?.vehicle?.blop ||
                        latest?.vehicle?.blob ||
                        latest?.trip?.vehicle?.image;

                    if (extractedBlop) {
                        setVehicleBlop(extractedBlop);
                    }
                }
            }

            if (!vehicleBlop) {
                try {
                    const tripRes = await API.get(`/trip/${tripId}`);
                    const directBlop = tripRes?.data?.vehicle?.blop || tripRes?.data?.vehicle?.blob;
                    if (directBlop) setVehicleBlop(directBlop);
                } catch (e) {
                    // Ignore fallback catch
                }
            }

        } catch (error) {
            console.warn("Location history fetch warning:", error?.message || error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocationHistory();
        const pollInterval = setInterval(() => {
            fetchLocationHistory();
        }, 3000);
        return () => clearInterval(pollInterval);
    }, [tripId]);

    // Compute exact active vehicle location dynamically
    const currentTruckLocation = positions.length > 0
        ? positions[positions.length - 1]
        : originCoords;

    const displayLocationName = getLocationText(latestLocationDetails);

    if (loading) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 font-medium animate-pulse">
                📡 Establishing Live GPS Satellite Link for Trip #{tripId || 'N/A'}...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center shadow-lg">
                <div>
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        <span>Live Fleet Telemetry</span>
                        <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-mono">
                            Trip #{tripId}
                        </span>
                    </h3>
                    <p className="text-xs text-emerald-400 animate-pulse mt-0.5 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                        <span>{displayLocationName}</span>
                    </p>
                </div>
                <div className="text-right text-xs text-slate-400">
                    <div>Logged Telemetry Pings: <span className="text-white font-mono font-bold">{positions.length}</span></div>
                    {latestLocationDetails?.timestamp && (
                        <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                            Updated: {new Date(latestLocationDetails.timestamp).toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </div>

            <div className="h-[460px] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
                <MapContainer
                    center={currentTruckLocation}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* ✴ Recenter Button - Current Active Coordinates Target Karega */}
                    <RecenterButton location={currentTruckLocation} />

                    {positions.length > 1 && (
                        <Polyline
                            positions={positions}
                            color="#2563eb"
                            weight={5}
                            opacity={0.8}
                        />
                    )}

                    {originCoords && (
                        <Marker position={originCoords} icon={originIcon}>
                            <Popup>
                                <div className="text-xs font-sans text-slate-900 space-y-1">
                                    <p className="font-bold text-emerald-600 border-b pb-1">🚩 Origin Dispatch Hub</p>
                                    <div><b>Source City:</b> {sourceCity || 'Origin Hub'}</div>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    <Marker position={currentTruckLocation} icon={createCustomTruckIcon(vehicleBlop)}>
                        <Popup>
                            <div className="text-xs font-sans text-slate-900 space-y-1">
                                <p className="font-bold border-b pb-1 text-blue-600">🚚 Live Vehicle Location</p>
                                <div><b>Current Location:</b> {displayLocationName}</div>
                                <div><b>Latitude:</b> {currentTruckLocation[0]?.toFixed(4)}</div>
                                <div><b>Longitude:</b> {currentTruckLocation[1]?.toFixed(4)}</div>
                            </div>
                        </Popup>

                        <Tooltip
                            permanent
                            direction="top"
                            offset={[0, -25]}
                            opacity={0.95}
                            interactive={false}
                        >
                            <span className="font-sans font-bold text-slate-900 text-xs px-1">
                                📍 {displayLocationName}
                            </span>
                        </Tooltip>
                    </Marker>

                    {destinationCoords && (
                        <Marker position={destinationCoords} icon={destinationIcon}>
                            <Popup>
                                <div className="text-xs font-sans text-slate-900 space-y-1">
                                    <p className="font-bold text-red-600 border-b pb-1">🏁 Target Destination</p>
                                    <div><b>City:</b> {destinationCity || 'Destination Target'}</div>
                                </div>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
        </div>
    );
};

export default LocationTracking;