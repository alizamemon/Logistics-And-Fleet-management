import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './src/pages/Login.jsx';
import Register from './src/pages/Register.jsx';
import Dashboard from './src/pages/Dashboard.jsx';
import ShipmentTracking from './src/pages/ShipmentTracking.jsx';

function App() {
    return (
        <div className="w-screen min-h-screen bg-slate-950 overflow-x-hidden m-0 p-0">
            <Router>
                <Routes>
                    <Route path="/" element={<ShipmentTracking />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/Register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;