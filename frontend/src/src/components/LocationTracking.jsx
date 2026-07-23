import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import API from '../services/api';
import 'leaflet/dist/leaflet.css';

// 🛑 Leaflet Default Asset Fix (Prevents Broken Marker Icons in Webpack/Vite)
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
});

// 🚚 Truck Icon (Blue Marker)
const truckIcon = new L.Icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

// 🏁 Destination Icon (Custom Red Marker)
const destinationIcon = L.divIcon({
    className: 'custom-destination-marker',
    html: `
        <div style="
            background-color: #ef4444; 
            width: 32px; 
            height: 32px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 0 12px rgba(239, 68, 68, 0.8);
            border: 2px solid #ffffff;
            font-size: 16px;
        ">
            🏁
        </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

// City Lat/Lng lookup dictionary
const CITY_COORDINATES = {
    'karachi': [24.8607, 67.0011],
    'lahore': [31.5204, 74.3587],
    'sahiwal': [30.6682, 73.1014],
    'islamabad': [33.6844, 73.0479],
    'rawalpindi': [33.5651, 73.0169],
    'khairpur': [27.5295, 68.7592],
    'multan': [30.1575, 71.5249],
    'faisalabad': [31.4504, 73.1350],
    'hyderabad': [25.3960, 68.3578],
    'peshawar': [34.0151, 71.5249],
    'quetta': [30.1798, 66.9750]
};

// 📍 Smooth Pan Helper: Only Pans if location actually changed
const DynamicMapUpdater = ({ center }) => {
    const map = useMap();
    const prevCenterRef = useRef(null);

    useEffect(() => {
        if (center && center.length === 2) {
            const [lat, lng] = center;
            const prev = prevCenterRef.current;

            // Only pan if coordinates actually change
            if (!prev || prev[0] !== lat || prev[1] !== lng) {
                map.panTo([lat, lng], { animate: true, duration: 1.0 });
                prevCenterRef.current = [lat, lng];
            }
        }
    }, [center, map]);

    return null;
};

const LocationTracking = ({ tripId, destinationCity = "" }) => {
    const [positions, setPositions] = useState([]);
    const [latestLocationDetails, setLatestLocationDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    const cleanCityName = (destinationCity || '').toLowerCase().trim();

    // Dynamic destination resolution with fallback to Islamabad
    const destinationCoords = CITY_COORDINATES[cleanCityName] || CITY_COORDINATES['islamabad'];

    const fetchLocationHistory = async () => {
        if (!tripId) {
            setLoading(false);
            return;
        }

        try {
            const response = await API.get(`/location-history/trip/${tripId}`);

            if (Array.isArray(response.data) && response.data.length > 0) {
                // Sanitize and filter valid latitude and longitude values
                const validCoordinates = response.data
                    .filter(loc => loc.latitude != null && loc.longitude != null)
                    .map(loc => [Number(loc.latitude), Number(loc.longitude)]);

                if (validCoordinates.length > 0) {
                    setPositions(validCoordinates);
                    setLatestLocationDetails(response.data[response.data.length - 1]);
                }
            }
        } catch (error) {
            console.error("Error fetching path coordinates:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocationHistory();

        const pollInterval = setInterval(() => {
            fetchLocationHistory();
        }, 3000); // Polling reduced to 3s for smooth GPS feel

        return () => clearInterval(pollInterval);
    }, [tripId]);

    // Baseline Fallback position (Karachi) if backend hasn't pushed GPS coordinates yet
    const currentTruckLocation = positions.length > 0
        ? positions[positions.length - 1]
        : [24.8607, 67.0011];

    if (loading) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 font-medium animate-pulse">
                📡 Establishing Satellite GPS Telemetry Link for Trip #{tripId || 'N/A'}...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Live Telemetry Status Header */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center shadow-lg">
                <div>
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        <span>Live Fleet Telemetry</span>
                        <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-mono">
                            Trip #{tripId}
                        </span>
                    </h3>
                    <p className="text-xs text-emerald-400 animate-pulse mt-0.5 font-medium">
                        ● Connected to GPS Satellites
                        {latestLocationDetails?.location && ` • ${latestLocationDetails.location}`}
                    </p>
                </div>
                <div className="text-right text-xs text-slate-400">
                    <div>Total Logged Pings: <span className="text-white font-mono font-bold">{positions.length}</span></div>
                    {latestLocationDetails?.timestamp && (
                        <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                            Last Ping: {new Date(latestLocationDetails.timestamp).toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </div>

            {/* Map Container */}
            <div className="h-[450px] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
                <MapContainer
                    center={currentTruckLocation}
                    zoom={7}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Smooth non-flickering pan */}
                    <DynamicMapUpdater center={currentTruckLocation} />

                    {/* Polyline Route Trail */}
                    {positions.length > 1 && (
                        <Polyline
                            positions={positions}
                            color="#3b82f6"
                            weight={5}
                            opacity={0.85}
                        />
                    )}

                    {/* 🚚 Current Moving Truck Marker */}
                    <Marker position={currentTruckLocation} icon={truckIcon}>
                        <Popup>
                            <div className="text-xs font-sans text-slate-900 space-y-1">
                                <p className="font-bold border-b pb-1 text-blue-600">🚚 Live Vehicle Position</p>
                                <div><b>Status:</b> {latestLocationDetails?.location || 'In Transit'}</div>
                                <div><b>Lat:</b> {currentTruckLocation[0]?.toFixed(4)}</div>
                                <div><b>Lng:</b> {currentTruckLocation[1]?.toFixed(4)}</div>
                            </div>
                        </Popup>
                    </Marker>

                    {/* 🏁 Destination Endpoint Marker */}
                    {destinationCoords && (
                        <Marker position={destinationCoords} icon={destinationIcon}>
                            <Popup>
                                <div className="text-xs font-sans text-slate-900 space-y-1">
                                    <p className="font-bold text-red-600 border-b pb-1">🏁 Target Destination</p>
                                    <div><b>Target City:</b> {destinationCity || 'Target Hub'}</div>
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