import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import  BookingDesk  from '../components/BookingDesk';
import bgImage from '../../assets/background.png';
import { Layers } from 'lucide-react';
import DriverOnboard from '../components/DriverOnboard.jsx';
import VehicleManagement from "../components/vehicleManagement.jsx";
import { vehicleService } from '../services/vehicleService';
import DriverManagement from "../components/DriverManagement.jsx";
import OperationsHub from "../components/OperationsHub.jsx";
import DriverIncomingRequests from "../components/DriverIncomingRequests.jsx";
import LogsCenter from "../components/LogsCenter.jsx";


const Dashboard = () => {
    // Current user aur unke roles state
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(''); // ADMIN, EMPLOYEE, DRIVER, USER

    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState([]);

    // Dynamic tab state base on role
    const [activeTab, setActiveTab] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState({ id: '', fullName: '', email: '', username: '', isActive: true });

    // 1. Fetch Logged-in User Information & Roles
    useEffect(() => {
        const fetchCurrentUserInfo = async () => {
            try {
                const cachedUser = JSON.parse(localStorage.getItem('user'));
                if (cachedUser) {
                    // Roles array se direct string names nikalen (e.g., ['ADMIN', 'EMPLOYEE'])
                    const rolesArray = cachedUser.roles ? cachedUser.roles.map(r => r.roleName) : [];

                    // 👇 YE LINE ADD KAREIN:
                    // Hum cachedUser object ke andar hi direct ".role" key inject kar dete hain taaki baki components ko direct string role mil sake!
                    const primaryRole = rolesArray.includes('ADMIN') ? 'ADMIN' :
                        rolesArray.includes('EMPLOYEE') ? 'EMPLOYEE' :
                            rolesArray.includes('DRIVER') ? 'DRIVER' : 'USER';

                    const enrichedUser = { ...cachedUser, role: primaryRole };
                    setCurrentUser(enrichedUser); // 👈 Ab enrichedUser pass hoga jisme .role property bilkul sahi format mein hogi!

                    if (rolesArray.includes('ADMIN')) {
                        setUserRole('ADMIN');
                        setActiveTab('fleet-overview');
                    } else if (rolesArray.includes('EMPLOYEE')) {
                        setUserRole('EMPLOYEE');
                        setActiveTab('ops-control');
                    } else if (rolesArray.includes('DRIVER')) {
                        setUserRole('DRIVER');
                        setActiveTab('trip-requests');
                    } else {
                        setUserRole('USER');
                        setActiveTab('profile');
                    }
                }
            } catch (err) {
                console.error("Failed to parse user role context", err);
            }
        };
        fetchCurrentUserInfo();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers();
            setUsers(response || []);
        } catch (err) {
            console.error("Failed to sync fleet users:", err);
            showNotification("Critical Matrix Sync Failure.", "error");
        } finally {
            setLoading(false);
        }
    };

    // Auto load users if role has access to IAM registry
    useEffect(() => {
        if (userRole === 'ADMIN' && (activeTab === 'iam-control' || activeTab === 'fleet-overview')) {
            loadUsers();
            loadVehicles();
        }
    }, [activeTab, userRole]);

    const showNotification = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const handlePromoteAdmin = async (id) => {
        try {
            await userService.promoteToAdmin(id);
            showNotification("User cleared for administrative control vectors.", "success");
            loadUsers();
        } catch (err) {
            showNotification("Failed to patch authorization level.", "error");
        }
    };

    const handlePromoteEmployee = async (id) => {
        try {
            await userService.promoteToEmployee(id); // Ensure this method exists in your frontend userService
            showNotification("User promoted to Logistics Employee successfully.", "success");
            loadUsers();
        } catch (err) {
            showNotification("Failed to promote user to Employee matrix.", "error");
        }
    };

    const handleMakeDriver = async (id) => {
        try {
            await userService.makeDriver(id);
            showNotification("User dispatched to active Fleet logs successfully.", "success");
            loadUsers();
        } catch (err) {
            showNotification("Failed to register user to fleet manifest.", "error");
        }
    };

    const handleDeleteUser = async (id, name) => {
        if (window.confirm(`Are you sure you want to terminate ${name || 'this user'}?`)) {
            try {
                await userService.deleteUser(id);
                showNotification("User account purged successfully.", "success");
                loadUsers();
            } catch (err) {
                showNotification("Failed to delete user structure.", "error");
            }
        }
    };

    const openEditModal = (user) => {
        setEditingUser({
            id: user.id,
            fullName: user.fullName || '',
            email: user.email || '',
            username: user.username || '',
            isActive: user.isActive !== false
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            await userService.updateUser(editingUser.id, {
                fullName: editingUser.fullName,
                email: editingUser.email,
                isActive: editingUser.isActive
            });
            showNotification("User parameter configurations patched successfully.", "success");
            setIsEditModalOpen(false);
            loadUsers();
        } catch (err) {
            showNotification("Failed to patch updated user nodes.", "error");
        }
    };

    const filteredUsers = users.filter(user => {
        // 1. Pehle search ki conditions check karein (Aap ka existing code)
        const matchesName = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesUsername = user.username?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesId = user.id?.toString() === searchTerm;
        const matchesSearch = matchesName || matchesUsername || matchesId;

        // 2. Ab check karein ke kya role match ho raha hai
        if (roleFilter === 'ALL') {
            return matchesSearch; // Agar 'ALL' selected hai, to sirf search match hona kafi hai
        }

        // User ke roles array mein se roleNames nikalen (e.g., ['DRIVER'] ya ['ADMIN'])
        const userRoles = user.roles ? user.roles.map(r => r.roleName) : [];
        const matchesRole = userRoles.includes(roleFilter);

        // Dono conditions true honi chahiye (Search bhi match ho aur Role bhi)
        return matchesSearch && matchesRole;
    });

    const loadVehicles = async () => {
        try {
            const response = await vehicleService.getAllVehicles();
            // Agar response direct array hai to use karein, nahi to response.data check karein
            const vehicleData = Array.isArray(response) ? response : (response?.data || []);
            setVehicles(vehicleData);
        } catch (err) {
            console.error("Failed to sync vehicles data:", err);
        }
    };

    return (
        <div
            className="fixed inset-0 h-full w-full flex text-gray-100 font-sans bg-cover bg-center bg-no-repeat overflow-hidden select-none"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-0" />

            <div className="relative w-full h-full flex flex-row z-10 overflow-hidden">

                {/* 🗺️ Sidebar - Dynamic Based on logged-in role */}
                <aside className={`
                    fixed md:relative top-0 bottom-0 left-0 z-40
                    ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 md:w-20 -translate-x-full md:translate-x-0'} 
                    bg-slate-900/95 border-r border-slate-800/80 p-5 flex flex-col justify-between 
                    shadow-2xl backdrop-blur-md shrink-0 transition-all duration-300
                `}>

                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="hidden md:flex absolute -right-3 top-7 bg-blue-600 hover:bg-blue-500 text-white w-6 h-6 rounded-full items-center justify-center text-xs border border-slate-700 shadow-md cursor-pointer z-50 transition-all"
                    >
                        {isSidebarOpen ? '◀' : '▶'}
                    </button>

                    <div className={isSidebarOpen ? 'block' : 'hidden md:block w-full'}>

                        <div className="mb-8 flex items-center justify-between md:justify-start gap-2 overflow-hidden">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                                    <Layers className="h-4 w-4" />
                                </div>
                                {isSidebarOpen && (
                                    <span className="text-white font-bold tracking-tight text-lg whitespace-nowrap animate-fadeIn">
                                        Logix<span className="text-blue-500 font-normal">Core</span>
                                    </span>
                                )}
                            </div>

                            {isSidebarOpen && (
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="flex md:hidden h-8 w-8 bg-blue-600 hover:bg-blue-500 rounded-lg items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer transition-all border border-blue-500"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* 🛠️ Dynamic Navigation Menu */}
                        <nav className="space-y-3">
                            {/* --- ADMIN ONLY TABS --- */}
                            {userRole === 'ADMIN' && (
                                <>
                                    <button
                                        onClick={() => setActiveTab('fleet-overview')}
                                        className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-4' : 'justify-center px-0'} py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'fleet-overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
                                    >
                                        <span className="text-sm">📊</span>
                                        {isSidebarOpen && <span className="whitespace-nowrap">Metrics</span>}
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('iam-control')}
                                        className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-4' : 'justify-center px-0'} py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'iam-control' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
                                    >
                                        <span className="text-sm">👥</span>
                                        {isSidebarOpen && <span className="whitespace-nowrap">All users</span>}
                                    </button>
                                </>
                            )}

                            {/* --- SHARED TABS (Admin & Employee Dono ke liye) --- */}
                            {(userRole === 'ADMIN' || userRole === 'EMPLOYEE') && (
                                <button
                                    onClick={() => setActiveTab('fleet-management')}
                                    className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-4' : 'justify-center px-0'} py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'fleet-management' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
                                >
                                    <span className="text-sm">🚚</span>
                                    {isSidebarOpen && <span className="whitespace-nowrap">Vehicle Management</span>}
                                </button>
                            )}

                            {/* --- NEW: DRIVER DIRECTORY FOR ADMIN & EMPLOYEE --- */}
                            {(userRole === 'ADMIN' || userRole === 'EMPLOYEE') && (
                                <button
                                    onClick={() => setActiveTab('driver-management')}
                                    className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-4' : 'justify-center px-0'} py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'driver-management' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
                                >
                                    <span className="text-sm">👨‍✈️</span>
                                    {isSidebarOpen && <span className="whitespace-nowrap">Driver Management</span>}
                                </button>
                            )}

                            {/* --- EMPLOYEE (OPERATIONS) TABS --- */}
                            {userRole === 'EMPLOYEE' && (
                                <>
                                    <button
                                        onClick={() => setActiveTab('ops-control')}
                                        className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-4' : 'justify-center px-0'} py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'ops-control' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                                    >
                                        <span className="text-sm">🛣️</span>
                                        {isSidebarOpen && <span className="whitespace-nowrap">Operations / Trips</span>}
                                    </button>
                                </>
                            )}

                            {/* --- BOOK SHIPMENT TAB FOR ADMIN & EMPLOYEE --- */}
                            {(userRole === 'ADMIN' || userRole === 'EMPLOYEE') && (
                                <>
                                    <button
                                        onClick={() => setActiveTab('book-shipment')}
                                        className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-4' : 'justify-center px-0'} py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'book-shipment' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
                                    >
                                        <span className="text-sm">📦</span>
                                        {isSidebarOpen && <span className="whitespace-nowrap">Book Shipment</span>}
                                    </button>

                                    {/* 📑 NEW: Logs & Audit Button */}
                                    <button
                                        onClick={() => setActiveTab('logs-center')}
                                        className={`w-full flex items-center ${isSidebarOpen ? 'space-x-3 px-4' : 'justify-center px-0'} py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'logs-center' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
                                    >
                                        <span className="text-sm">📜</span>
                                        {isSidebarOpen && <span className="whitespace-nowrap">System Audit Logs</span>}
                                    </button>
                                </>
                            )}

                            {/* --- DRIVER TABS --- */}
                            {userRole === 'DRIVER' && (
                                <div className="space-y-1 w-full">
                                    {/* 1. Trip Requests Button */}
                                    <button
                                        onClick={() => setActiveTab('trip-requests')}
                                        className={`w-full flex items-center ${
                                            isSidebarOpen ? 'space-x-3 px-4' : 'justify-center px-0'
                                        } py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                            activeTab === 'trip-requests'
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                                        }`}
                                    >
                                        <span className="text-sm">📥</span>
                                        {isSidebarOpen && <span className="whitespace-nowrap">Trip Requests</span>}
                                    </button>

                                    {/* 2. Active Trips Button */}
                                    <button
                                        onClick={() => setActiveTab('active-trips')}
                                        className={`w-full flex items-center ${
                                            isSidebarOpen ? 'space-x-3 px-4' : 'justify-center px-0'
                                        } py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                            activeTab === 'active-trips'
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                                        }`}
                                    >
                                        <span className="text-sm">🚚</span>
                                        {isSidebarOpen && <span className="whitespace-nowrap">Active Trips</span>}
                                    </button>

                                    {/* 3. Completed History Button (Naya Content) */}
                                    <button
                                        onClick={() => setActiveTab('completed-history')}
                                        className={`w-full flex items-center ${
                                            isSidebarOpen ? 'space-x-3 px-4' : 'justify-center px-0'
                                        } py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                            activeTab === 'completed-history'
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                                        }`}
                                    >
                                        <span className="text-sm">🏁</span>
                                        {isSidebarOpen && <span className="whitespace-nowrap">Completed History</span>}
                                    </button>

                                </div>
                            )}
                        </nav>
                    </div>

                    <div className={`border-t border-slate-800 pt-4 ${isSidebarOpen ? 'block' : 'hidden md:block w-full'}`}>
                        <button
                            onClick={() => userService.logout()}
                            className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 py-2.5 rounded-xl text-xs font-bold transition-all tracking-wide shadow-md uppercase cursor-pointer flex justify-center items-center"
                        >
                            {isSidebarOpen ? 'logout' : '🚪'}
                        </button>
                    </div>
                </aside>

                {/* Main Content Window */}
                <main className="flex-1 p-4 md:p-10 overflow-y-auto bg-slate-950/40 backdrop-blur-[1px] h-full w-full">

                    {/* Mobile Menu Header */}
                    <div className="flex md:hidden items-center justify-between mb-4 bg-slate-900/80 p-3 border border-slate-800 rounded-xl">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="text-white text-lg bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 cursor-pointer"
                        >
                            ☰
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="h-7 w-7 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                <Layers className="h-3.5 w-3.5" />
                            </div>
                            <h2 className="text-base font-bold !text-white tracking-tight">
                                Logix<span className="text-blue-500 font-normal">Core</span>
                            </h2>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`mb-6 p-4 rounded-xl text-xs border font-semibold tracking-wide ${
                            message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    {/* 👇 YAHAN PAR APNA DRIVER VIEW INJECT KAREIN */}
                    {(userRole === 'ADMIN' || userRole === 'EMPLOYEE') && activeTab === 'driver-management' && (
                        <div className="animate-fadeIn">
                            <DriverManagement currentUser={currentUser} showNotification={showNotification} />
                        </div>
                    )}

                    {(userRole === 'ADMIN' || userRole === 'EMPLOYEE') && activeTab === 'fleet-management' && (
                        <div className="animate-fadeIn">
                            <VehicleManagement currentUser={currentUser} showNotification={showNotification} />
                        </div>
                    )}

                    {/* 📊 ADMIN VIEW 1: FLEET OVERVIEW */}
                    {userRole === 'ADMIN' && activeTab === 'fleet-overview' && (
                        <div className="space-y-6 md:space-y-8 animate-fadeIn">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight !text-white">Admin System Overview</h1>
                                <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-2xl bg-slate-950/60 p-3 rounded-xl inline-block border border-slate-800/40">Secure administrative oversight of active nodes.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl shadow-xl">
                                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total Registered Cargo Staff</span>
                                    <h3 className="text-3xl font-black mt-3 text-blue-500">{users.length}</h3>
                                </div>


                                <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl shadow-xl">
                                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total Registered Vehicles</span>
                                    <h3 className="text-3xl font-black mt-3 text-indigo-400">{vehicles.length}</h3>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* 📦 SENDER & SHIPMENT BOOKING VIEW */}
                    {(userRole === 'ADMIN' || userRole === 'EMPLOYEE') && activeTab === 'book-shipment' && (
                        <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight !text-white">Counter Booking Desk</h1>
                                <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-2xl bg-slate-950/60 p-3 rounded-xl inline-block border border-slate-800/40">
                                    Search existing clients by phone number or register a new one to process active freight bookings.
                                </p>
                            </div>
                            <BookingDesk showNotification={showNotification} />
                        </div>
                    )}

                    {/* 📜 NEW: SYSTEM AUDIT LOGS CENTER (ADMIN & EMPLOYEE) */}
                    {(userRole === 'ADMIN' || userRole === 'EMPLOYEE') && activeTab === 'logs-center' && (
                        <div className="animate-fadeIn max-w-6xl mx-auto">
                            <LogsCenter showNotification={showNotification} />
                        </div>
                    )}

                    {/* 🛠️ DRIVER FLOW: ONBOARDING CHECK & VIEW ROUTING */}
                    {userRole === 'DRIVER' && (
                        <div className="animate-fadeIn">
                            {/* Hum yahan DriverOnboard render karenge aur usko allow karenge dashboard control krne ka */}
                            <DriverOnboard
                                currentUser={currentUser}
                                showNotification={showNotification}
                                onOnboardSuccess={() => {
                                    // Profile complete hone par page sync ya load karwa sakte hain
                                    loadUsers();
                                }}
                            />

                            {/* 👇 Baki tabs sirf tabhi render hon jab driver onboarding pass ho jaye (Ye logic hum check krwate hain) */}
                            {activeTab === 'trip-requests' && (
                                <DriverIncomingRequests
                                    userId={currentUser?.id}
                                    showNotification={showNotification}
                                    viewMode="REQUESTS"
                                />
                            )}

                            {activeTab === 'active-trips' && (
                                <DriverIncomingRequests
                                    userId={currentUser?.id}
                                    showNotification={showNotification}
                                    viewMode="ACTIVE"
                                />
                            )}
                            {activeTab === 'completed-history' && (
                                <DriverIncomingRequests
                                    userId={currentUser?.id}
                                    showNotification={showNotification}
                                    viewMode="COMPLETED"
                                />
                            )}

                        </div>
                    )}

                    {/* 👥 ADMIN VIEW 2: PERSONNEL & ROLE MANAGEMENT (IAM CONTROL) */}
                    {userRole === 'ADMIN' && activeTab === 'iam-control' && (
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md animate-fadeIn">
                            <div className="p-4 md:p-6 border-b border-slate-800 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-slate-900/40 w-full">
                                <div>
                                    <h2 className="text-lg md:text-xl font-bold !text-white tracking-tight flex w-full">Personnel & Role Management</h2>
                                    <p className="text-slate-400 text-xs mt-1">Elevate users to Admins, Employees, or Drivers.</p>
                                </div>

                                {/* ✨ NAYA FILTERS + SEARCH CONTAINER */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">

                                    {/* Left Side inside container: Role Filter Tabs */}
                                    <div className="flex gap-1.5 bg-slate-950/40 p-1 rounded-xl border border-slate-800/60 w-full sm:w-auto overflow-x-auto">
                                        {['ALL', 'USER', 'EMPLOYEE', 'DRIVER'].map((role) => (
                                            <button
                                                key={role}
                                                onClick={() => setRoleFilter(role)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                                    roleFilter === role
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                                }`}
                                            >
                                                {role === 'ALL' ? 'Show All' : role}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Right Side inside container: Search Input and Sync */}
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="bg-slate-950/60 border border-slate-800 px-4 py-2 rounded-xl text-xs md:text-sm text-slate-200 focus:outline-none focus:border-blue-500 w-full lg:w-64"
                                        />
                                        <button onClick={loadUsers} className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer">
                                            🔄 Sync
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="p-16 text-center text-slate-400 font-medium animate-pulse text-xs md:text-sm">Syncing infrastructure...</div>
                            ) : (
                                <>
                                    {/* DESKTOP TABLE */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-slate-800/80 text-slate-300 text-xs font-bold tracking-wider uppercase border-b border-slate-800">
                                            <tr>
                                                <th className="py-4 px-4 pl-6 w-16">ID</th>
                                                <th className="py-4 px-4">Staff Name</th>
                                                <th className="py-4 px-4">Username</th>
                                                <th className="py-4 px-4">Roles</th>
                                                <th className="py-4 px-4 text-center">Assign Role Clearances</th>
                                                <th className="py-4 px-6 text-center">Actions</th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-800 text-sm text-gray-200 bg-black/10">
                                            {filteredUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="p-10 text-center text-slate-500">No nodes found.</td>
                                                </tr>
                                            ) : (
                                                filteredUsers.map((u) => (
                                                    <tr key={u.id} className="hover:bg-slate-800/30 transition-all">
                                                        <td className="py-4 px-4 pl-6 font-mono text-slate-500 text-xs">#{u.id}</td>
                                                        <td className="py-4 px-4 font-bold text-white">{u.fullName || 'Unassigned'}</td>
                                                        <td className="py-4 px-4 text-slate-300">{u.username}</td>
                                                        <td className="py-4 px-4">
                                                            <div className="flex gap-1.5 flex-wrap">
                                                                {u.roles?.map((r) => (
                                                                    <span key={r.id} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                                                        r.roleName === 'ADMIN' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' :
                                                                            r.roleName === 'EMPLOYEE' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                                                                                r.roleName === 'DRIVER' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                                                                    'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                                                    }`}>{r.roleName}</span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 text-center">
                                                            <div className="flex justify-center gap-2">
                                                                <button onClick={() => handlePromoteAdmin(u.id)} className="px-2.5 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl text-[10px] font-bold cursor-pointer">Admin</button>
                                                                {/* ✨ PROMOTED TO EMPLOYEE BUTTON */}
                                                                <button onClick={() => handlePromoteEmployee(u.id)} className="px-2.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-[10px] font-bold cursor-pointer">Employee</button>
                                                                <button onClick={() => handleMakeDriver(u.id)} className="px-2.5 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl text-[10px] font-bold cursor-pointer">Driver</button>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-center">
                                                            <div className="flex justify-center gap-2">
                                                                <button onClick={() => openEditModal(u)} className="p-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer">✏️</button>
                                                                <button onClick={() => handleDeleteUser(u.id, u.fullName)} className="p-1.5 bg-red-600/10 text-red-400 border border-red-500/20 rounded-xl text-xs cursor-pointer">🗑️</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* MOBILE CARDS (DASHBOARD FOR MOBILE ADMINDER) */}
                                    <div className="block md:hidden p-4 space-y-4">
                                        {filteredUsers.length === 0 ? (
                                            <div className="text-center p-6 text-slate-500 text-xs">No matching nodes found.</div>
                                        ) : (
                                            filteredUsers.map((u) => (
                                                <div key={u.id} className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-3 shadow-md">
                                                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                                        <span className="font-mono text-xs text-slate-500">#{u.id}</span>
                                                        <div className="flex gap-1.5">
                                                            {u.roles?.map((r) => (
                                                                <span key={r.id} className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                                                                    r.roleName === 'ADMIN' ? 'bg-pink-500/20 text-pink-400' :
                                                                        r.roleName === 'EMPLOYEE' ? 'bg-indigo-500/20 text-indigo-400' :
                                                                            r.roleName === 'DRIVER' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-300'
                                                                }`}>{r.roleName}</span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-sm font-bold text-white">{u.fullName || 'Unassigned'}</h4>
                                                        <p className="text-xs text-slate-400">@{u.username}</p>
                                                    </div>

                                                    <div className="flex flex-col gap-2 pt-1">
                                                        <div className="flex gap-1.5 flex-wrap">
                                                            <button onClick={() => handlePromoteAdmin(u.id)} className="px-2 py-1 bg-pink-600 text-white rounded-lg text-[10px] font-bold">Admin</button>
                                                            <button onClick={() => handlePromoteEmployee(u.id)} className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold">Employee</button>
                                                            <button onClick={() => handleMakeDriver(u.id)} className="px-2 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-bold">Driver</button>
                                                        </div>
                                                        <div className="flex gap-1.5 justify-end border-t border-slate-800/60 pt-2">
                                                            <button onClick={() => openEditModal(u)} className="p-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs">✏️</button>
                                                            <button onClick={() => handleDeleteUser(u.id, u.fullName)} className="p-1.5 bg-red-950/40 text-red-400 rounded-lg text-xs">🗑️</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* 🚚 TRIPS & LOGISTICS OPERATIONS HUB (ADMIN + EMPLOYEE) */}
                    {(userRole === 'ADMIN' || userRole === 'EMPLOYEE') && activeTab === 'ops-control' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight !text-white">
                                    Logistics Operations Hub
                                </h1>
                                <p className="text-slate-400 text-xs md:text-sm mt-1">
                                    Manage shipments dispatching and monitor active fleet trip manifests.
                                </p>
                            </div>

                            {/* Master Hub Component */}
                            <OperationsHub showNotification={showNotification} userRole={userRole} />
                        </div>
                    )}

                    {/* 🛣️ DRIVER VIEW: MY TRIPS & PROFILE UPDATE */}
                    {userRole === 'DRIVER' && activeTab === 'my-trips' && (
                        <div className="space-y-6 animate-fadeIn">

                            <DriverOnboard
                                currentUser={currentUser}
                                showNotification={showNotification}
                            />

                        </div>
                    )}

                </main>
            </div>

            {/* Edit Modal (Personnel Configurations) */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                        <h3 className="text-lg font-bold text-white mb-2">Patch User Configurations</h3>
                        <p className="text-slate-400 text-xs mb-6">Modify node identifiers for username base: <span className="text-blue-400 font-mono">@{editingUser.username}</span></p>

                        <form onSubmit={handleUpdateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">Staff Matrix Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editingUser.fullName}
                                    onChange={(e) => setEditingUser({...editingUser, fullName: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">Secure Email Reference</label>
                                <input
                                    type="email"
                                    required
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                                />
                            </div>

                            <div className="flex items-center space-x-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                                <input
                                    type="checkbox"
                                    id="nodeActive"
                                    checked={editingUser.isActive}
                                    onChange={(e) => setEditingUser({...editingUser, isActive: e.target.checked})}
                                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0 cursor-pointer"
                                />
                                <label htmlFor="nodeActive" className="text-xs font-semibold text-slate-300 cursor-pointer">Node Operational (Is Active)</label>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/10 transition-all cursor-pointer"
                                >
                                    Save System Parameters
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;