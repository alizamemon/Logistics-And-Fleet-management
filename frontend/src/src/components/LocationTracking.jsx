import React, { useState, useEffect, useRef } from 'react';
// 1️⃣ Tooltip ko import me add kiya
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

// 🚚 Truck Icon
const truckIcon = new L.Icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

// 🏁 Destination Icon
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
    'mirpurkhas': [25.5269, 69.0111],
    'badin': [24.6559, 68.8383],
    'ghotki': [28.0044, 69.3162],
    'sahiwal': [30.6682, 73.1014],
    'gujranwala': [32.1617, 74.1883],
    'sialkot': [32.4945, 74.5229],
    'sargodha': [32.0836, 72.6711],
    'bahawalpur': [29.3544, 71.6911],
    'rahim yar khan': [28.4212, 70.2989],
    'rahimyar khan': [28.4212, 70.2989],
    'okara': [30.8100, 73.4597],
    'jhelum': [32.9405, 73.7276],
    'gujrat': [32.5742, 74.0754],
    'mardan': [34.1986, 72.0404],
    'abbottabad': [34.1688, 73.2215],
    'swat': [35.2227, 72.4258],
    'mingora': [34.7717, 72.3600],
    'nowshera': [34.0153, 71.9747],
    'gwadar': [25.1264, 62.3225],
    'hub': [24.9018, 66.8833],
    'khuzdar': [27.8164, 66.6057]
};

// 📍 Smooth Pan Helper
const DynamicMapUpdater = ({ center }) => {
    const map = useMap();
    const prevCenterRef = useRef(null);

    useEffect(() => {
        if (center && center.length === 2) {
            const [lat, lng] = center;
            const prev = prevCenterRef.current;
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
    const destinationCoords = CITY_COORDINATES[cleanCityName] || CITY_COORDINATES['islamabad'];

    const fetchLocationHistory = async () => {
        if (!tripId) {
            setLoading(false);
            return;
        }
        try {
            const response = await API.get(`/location-history/trip/${tripId}`);
            if (Array.isArray(response.data) && response.data.length > 0) {
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
        }, 3000);
        return () => clearInterval(pollInterval);
    }, [tripId]);

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

                    <DynamicMapUpdater center={currentTruckLocation} />

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

                        {/* 2️⃣ Hamesha visible rehta hua label add kiya */}
                        <Tooltip
                            permanent // Hamesha dikhana hai
                            direction="top" // Marker ke upar dikhana hai
                            offset={[0, -40]} // Thora upar adjust karne ke liye
                            className="bg-slate-900 border border-slate-700 text-white font-bold text-xs p-2 rounded-lg shadow-xl" // Styling
                        >
                            {/* OSRM simulation se jo location name aarha hai (e.g., "Near Sukkur Highway") wo dikhayega */}
                            {latestLocationDetails?.location || 'En Route'}
                        </Tooltip>
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