import React, { useState, useEffect, useRef } from 'react';
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

// 🚚 Custom Truck Marker Icon
const truckIcon = new L.Icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
    iconSize: [28, 45],
    iconAnchor: [14, 45],
    popupAnchor: [0, -40]
});

// 🏁 Destination Marker Icon
const destinationIcon = L.divIcon({
    className: 'custom-destination-marker',
    html: `
        <div style="
            background-color: #ef4444; 
            width: 34px; 
            height: 34px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 0 12px rgba(239, 68, 68, 0.8);
            border: 2px solid #ffffff;
            font-size: 18px;
        ">
            🏁
        </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
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

// 📍 Smooth Camera Pan Helper
const DynamicMapUpdater = ({ center }) => {
    const map = useMap();
    const prevCenterRef = useRef(null);

    useEffect(() => {
        if (center && center.length === 2) {
            const [lat, lng] = center;
            const prev = prevCenterRef.current;
            if (!prev || prev[0] !== lat || prev[1] !== lng) {
                map.panTo([lat, lng], { animate: true, duration: 1.2 });
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

    // 🛠 Safely extracts location text regardless of backend DTO naming
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
            console.error("Error fetching location telemetry:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocationHistory();
        const pollInterval = setInterval(() => {
            fetchLocationHistory();
        }, 4000);
        return () => clearInterval(pollInterval);
    }, [tripId]);

    const currentTruckLocation = positions.length > 0
        ? positions[positions.length - 1]
        : [24.8607, 67.0011];

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
            {/* Live Telemetry Status Header */}
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

            {/* Map Container */}
            <div className="h-[460px] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
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

                    {/* Polyline: Direct path trail on map */}
                    {positions.length > 1 && (
                        <Polyline
                            positions={positions}
                            color="#2563eb"
                            weight={5}
                            opacity={0.8}
                        />
                    )}

                    {/* 🚚 Current Moving Truck Marker */}
                    <Marker position={currentTruckLocation} icon={truckIcon}>
                        <Popup>
                            <div className="text-xs font-sans text-slate-900 space-y-1">
                                <p className="font-bold border-b pb-1 text-blue-600">🚚 Live Vehicle Location</p>
                                <div><b>Current Location:</b> {displayLocationName}</div>
                                <div><b>Latitude:</b> {currentTruckLocation[0]?.toFixed(4)}</div>
                                <div><b>Longitude:</b> {currentTruckLocation[1]?.toFixed(4)}</div>
                            </div>
                        </Popup>

                        {/* Always visible label above moving truck */}
                        <Tooltip
                            permanent
                            direction="top"
                            offset={[0, -40]}
                            opacity={0.95}
                            interactive={false}
                        >
                            <span className="font-sans font-bold text-slate-900 text-xs px-1">
                                📍 {displayLocationName}
                            </span>
                        </Tooltip>
                    </Marker>

                    {/* 🏁 Destination Endpoint Marker */}
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