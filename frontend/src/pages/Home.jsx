import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/dashboard.css'; // We will build this CSS file next!

const Home = () => {
    const navigate = useNavigate();
    
    // --- STATE MANAGEMENT ---
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // Initialize Theme State from localStorage
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('darkMode');
        return savedTheme === 'true'; 
    });

    const [stats, setStats] = useState({
        patientsToday: 0, patientsTrend: 0,
        newRegistrations: 0, registrationsTrend: 0,
        testsPrescribed: 0, testsTrend: 0,
        dailyRevenue: 0, revenueTrend: 0
    });
    
    const [recentPatients, setRecentPatients] = useState([]);
    
    // --- HELPER FUNCTIONS ---
    const handleAuthError = (status) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem('doctorToken');
            localStorage.removeItem('doctorName');
            localStorage.removeItem('dbName');
            navigate('/');
        }
    };

    const formatName = (name) => {
        if (!name) return "Unknown";
        return name.toLowerCase().split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const getInitials = (name) => {
        if (!name || name === "Unknown") return "?";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const getAvatarStyle = (index) => {
        const styles = [
            { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600' },
            { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600' },
            { bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-300' },
            { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-600' },
            { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600' }
        ];
        return styles[index % styles.length];
    };

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem('darkMode', newTheme);
    };

    const handleLogout = () => {
        localStorage.removeItem('doctorToken');
        localStorage.removeItem('doctorName');
        localStorage.removeItem('dbName');
        navigate('/');
    };

    // --- DATA FETCHING EFFECTS ---
    useEffect(() => {
        const token = localStorage.getItem('doctorToken');
        if (!token) { navigate('/'); return; }

        const fetchDashboardData = async () => {
            try {
                const statsRes = await fetch('https://patient-record-app-drly.onrender.com/api/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!statsRes.ok) { handleAuthError(statsRes.status); return; }
                const statsData = await statsRes.json();
                if (statsData.success) setStats(statsData.stats); 

                const recentRes = await fetch('https://patient-record-app-drly.onrender.com/api/patients/recent', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!recentRes.ok) { handleAuthError(recentRes.status); return; }
                const recentData = await recentRes.json();
                if (recentData.success) setRecentPatients(recentData.patients);

            } catch (error) { console.error('Error fetching dashboard data:', error); }
        };

        fetchDashboardData();
    }, [navigate]);

    // Search Debounce Effect
    useEffect(() => {
        const token = localStorage.getItem('doctorToken');
        const fetchSearchResults = async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]); setShowDropdown(false); return;
            }
            try {
                const res = await fetch(`https://patient-record-app-drly.onrender.com/api/patients/search?q=${encodeURIComponent(searchQuery)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) { handleAuthError(res.status); return; }
                const data = await res.json();
                if (data.success) { setSearchResults(data.results); setShowDropdown(true); }
            } catch (error) { console.error("Search error:", error); }
        };
        const delayDebounceFn = setTimeout(() => fetchSearchResults(), 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, navigate]);

    return (
        <div className={`app-container ${isDark ? 'dark' : ''}`}>
            <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-hidden font-['Inter']">
                
                {/* --- SIDEBAR --- */}
                <aside className={`flex flex-col py-6 border-r border-emerald-50 dark:border-emerald-900/20 sidebar-gradient z-20 shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-[280px]' : 'w-[80px]'}`}>
                    
                    {/* Logo Section */}
                    <div className="mb-8 px-6 flex items-center gap-3 text-emerald-500 overflow-hidden">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 p-1.5 rounded-lg transition-colors shrink-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">menu</span>
                        </button>
                        {isSidebarOpen && (
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className="material-symbols-outlined text-3xl shrink-0">medical_services</span>
                                <span className="font-bold text-xl tracking-tight">MediFlow</span>
                            </div>
                        )}
                    </div>

                    {/* Doctor Profile */}
                    <div className={`px-4 mb-8 flex flex-col transition-all ${isSidebarOpen ? 'items-start' : 'items-center'}`}>
                        <div className={`flex items-center gap-3 py-4 w-full border-b border-emerald-100/50 dark:border-emerald-800/30 px-2 transition-all ${!isSidebarOpen && 'justify-center'}`}>
                            <div className={`rounded-2xl bg-white dark:bg-slate-700 overflow-hidden border-2 border-emerald-500/20 premium-shadow shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-12 h-12' : 'w-10 h-10 rounded-full'}`}>
                                <img alt="Doctor profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAA5LdANAUa2KwGpdHFThaxvz60QKnY86uujQYa7kzWemiV_fYEzTS1PoWpGtqeox60pgP_fkrcvuXwaifghpeWF1KDw9U3J7BjuhgrSl8gS639_AGaBFa2OOogt-nEZXMeVPG6P8fHux0KNrfQYe44O8ZUsEzh3iq6zsTBVBytXS6vQ-M4d1GWNuUn5wGyvO7nhHKKOMIUTEix065iYxbzJHC94q2oQMKFeok6YMNnhOQxZzwkUwEpNQUmpFjnEUvlCH2crqTLBQ" />
                            </div>
                            {isSidebarOpen && (
                                <div className="flex-1 min-w-0 transition-all">
                                    <p className="text-sm font-bold truncate text-slate-900 dark:text-white">Dr. S.S. Gupta</p>
                                    <p className="text-[11px] text-slate-500 dark:text-emerald-400/80 font-medium truncate">Cardiologist</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex flex-col gap-1.5 flex-1 px-4 overflow-y-auto custom-scrollbar">
                        <button className={`group flex items-center w-full h-11 rounded-xl bg-emerald-500 text-white premium-shadow transition-all ${isSidebarOpen ? 'px-4' : 'justify-center'}`}>
                            <span className="material-symbols-outlined text-xl shrink-0">dashboard</span>
                            {isSidebarOpen && <span className="ml-3 font-medium text-sm">Dashboard</span>}
                        </button>
                        
                        <button onClick={() => navigate('/patients')} className={`group flex items-center w-full h-11 rounded-xl text-emerald-800 dark:text-emerald-300 hover:text-emerald-500 hover:bg-white/80 dark:hover:bg-emerald-900/40 transition-all ${isSidebarOpen ? 'px-4' : 'justify-center'}`}>
                            <span className="material-symbols-outlined text-xl shrink-0">group</span>
                            {isSidebarOpen && <span className="ml-3 font-medium text-sm">Patients</span>}
                        </button>

                        <button onClick={() => navigate('/new-patient')} className={`group flex items-center w-full h-11 rounded-xl text-emerald-800 dark:text-emerald-300 hover:text-emerald-500 hover:bg-white/80 dark:hover:bg-emerald-900/40 transition-all ${isSidebarOpen ? 'px-4' : 'justify-center'}`}>
                            <span className="material-symbols-outlined text-xl shrink-0">add_circle</span>
                            {isSidebarOpen && <span className="ml-3 font-medium text-sm">New Patient</span>}
                        </button>
                        
                        {/* Placeholder Links for mockup accuracy */}
                        <button className={`group flex items-center w-full h-11 rounded-xl text-emerald-800 dark:text-emerald-300 hover:text-emerald-500 hover:bg-white/80 dark:hover:bg-emerald-900/40 transition-all ${isSidebarOpen ? 'px-4' : 'justify-center'}`}>
                            <span className="material-symbols-outlined text-xl shrink-0">assessment</span>
                            {isSidebarOpen && <span className="ml-3 font-medium text-sm">Reports</span>}
                        </button>
                        
                        <button className={`group flex items-center w-full h-11 rounded-xl text-emerald-800 dark:text-emerald-300 hover:text-emerald-500 hover:bg-white/80 dark:hover:bg-emerald-900/40 transition-all ${isSidebarOpen ? 'px-4' : 'justify-center'}`}>
                            <span className="material-symbols-outlined text-xl shrink-0">calendar_today</span>
                            {isSidebarOpen && <span className="ml-3 font-medium text-sm">Appointments</span>}
                        </button>

                        <button className={`group flex items-center w-full h-11 rounded-xl text-emerald-800 dark:text-emerald-300 hover:text-emerald-500 hover:bg-white/80 dark:hover:bg-emerald-900/40 transition-all ${isSidebarOpen ? 'px-4' : 'justify-center'}`}>
                            <span className="material-symbols-outlined text-xl shrink-0">settings</span>
                            {isSidebarOpen && <span className="ml-3 font-medium text-sm">Settings</span>}
                        </button>
                    </nav>

                    {/* Bottom Actions (Theme & Logout) */}
                    <div className="mt-auto px-4 flex flex-col gap-2">
                        <div className={`flex items-center py-3 ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center'}`}>
                            <div className="relative inline-block w-8 h-4 align-middle select-none transition duration-200 ease-in shrink-0" onClick={toggleTheme}>
                                <input type="checkbox" checked={isDark} readOnly className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-2 border-emerald-200 appearance-none cursor-pointer outline-none transition-all duration-300 z-10 checked:right-0 checked:border-emerald-500" />
                                <label className="block overflow-hidden h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/50 cursor-pointer transition-all duration-300"></label>
                            </div>
                            {isSidebarOpen && <span className="text-xs font-semibold text-slate-500 truncate">Dark Mode</span>}
                        </div>
                        
                        <button onClick={handleLogout} className={`w-full h-11 flex items-center rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all ${isSidebarOpen ? 'px-4' : 'justify-center'}`}>
                            <span className="material-symbols-outlined text-xl shrink-0">logout</span>
                            {isSidebarOpen && <span className="ml-3 font-medium text-sm">Logout</span>}
                        </button>
                    </div>
                </aside>

                {/* --- MAIN DASHBOARD CONTENT --- */}
                <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-6 lg:p-8 transition-all duration-300 relative">
                    
                    {/* Header Row */}
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0 relative z-30">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">Welcome back, Dr. Gupta</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your practice and patients efficiently.</p>
                        </div>
                        
                        {/* Search Bar */}
                        <div className="relative max-w-md w-full">
                            <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 glass-card px-4 py-2 rounded-2xl premium-shadow w-full">
                                <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
                                <input 
                                    type="text" 
                                    placeholder="Search patients or records..." 
                                    className="border-none focus:ring-0 bg-transparent w-full text-sm py-1 placeholder-slate-400 text-slate-800 dark:text-slate-200 outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                    <span>⌘</span>K
                                </kbd>
                            </div>

                            {/* Search Dropdown */}
                            {showDropdown && searchResults.length > 0 && (
                                <div className="absolute top-[110%] left-0 right-0 bg-white dark:bg-slate-800 rounded-xl premium-shadow border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                                    {searchResults.map((patient, index) => (
                                        <div key={index} onClick={() => navigate(`/old-patient?id=${patient.VisitID}`)} className="flex justify-between p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors">
                                            <div>
                                                <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">{formatName(patient.PatientName)}</div>
                                                <div className="text-xs text-slate-500">{patient.Mobile || 'No Mobile'}</div>
                                            </div>
                                            <div className="text-emerald-500 text-sm font-semibold flex items-center">View →</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Stats Row */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 shrink-0">
                        
                        <div className="gradient-blue glass-card p-4 rounded-2xl premium-shadow transition-all card-hover flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-2xl">person</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest truncate">Patients Today</h3>
                                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full ml-1 shrink-0">+12%</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.patientsToday || 42}</span>
                                    <span className="text-[10px] text-slate-400">vs 34</span>
                                </div>
                            </div>
                        </div>

                        <div className="gradient-purple glass-card p-4 rounded-2xl premium-shadow transition-all card-hover flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-2xl">event_available</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest truncate">Weekly Visits</h3>
                                    <span className="text-[9px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-full ml-1 shrink-0">-4%</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.newRegistrations || 186}</span>
                                    <span className="text-[10px] text-slate-400">vs 194</span>
                                </div>
                            </div>
                        </div>

                        <div className="gradient-orange glass-card p-4 rounded-2xl premium-shadow transition-all card-hover flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-2xl">science</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest truncate">Tests Pending</h3>
                                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full ml-1 shrink-0">+8%</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.testsPrescribed || 12}</span>
                                    <span className="text-[10px] text-slate-400">4 urgent</span>
                                </div>
                            </div>
                        </div>

                        <div className="gradient-mint glass-card p-4 rounded-2xl premium-shadow transition-all card-hover flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-2xl">payments</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest truncate">Daily Revenue</h3>
                                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full ml-1 shrink-0">+18%</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">${stats.dailyRevenue || '2,840'}</span>
                                    <span className="text-[10px] text-slate-400">from 24</span>
                                </div>
                            </div>
                        </div>

                    </section>

                    {/* Recent Patients Table */}
                    <section className="bg-white/70 dark:bg-slate-800/50 glass-card rounded-[28px] premium-shadow overflow-hidden flex flex-col flex-1 min-h-0">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between shrink-0 bg-white/40 dark:bg-slate-800/40 sticky top-0 z-20 backdrop-blur-md">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Patients</h2>
                            <button onClick={() => navigate('/patients')} className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold rounded-xl hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2">
                                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">
                            <table className="w-full text-left border-separate border-spacing-y-2 min-w-[800px]">
                                <thead className="sticky top-0 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md z-10 shadow-sm sidebar-gradient border-b border-slate-200 dark:border-slate-700">
                                    <tr className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        <th className="px-6 py-4 font-bold">Patient Profile</th>
                                        <th className="px-6 py-4 font-bold text-center">Status</th>
                                        <th className="px-6 py-4 font-bold">Appointment</th>
                                        <th className="px-6 py-4 font-bold">Last Visit</th>
                                        <th className="px-6 py-4 font-bold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPatients.length > 0 ? recentPatients.map((patient, index) => {
                                        const dateObj = new Date(patient.VisitDate);
                                        const formattedDate = `${dateObj.getDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][dateObj.getMonth()]}, ${dateObj.getFullYear()}`;
                                        const cleanName = formatName(patient.PatientName);
                                        const initials = getInitials(cleanName);
                                        const avatarStyle = getAvatarStyle(index);

                                        return (
                                            <tr key={index} onClick={() => navigate(`/old-patient?id=${patient.VisitID}`)} className="table-row-hover bg-white/50 dark:bg-slate-800/30 transition-all group cursor-pointer">
                                                <td className="px-6 py-3 rounded-l-2xl">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 premium-shadow ${avatarStyle.bg} ${avatarStyle.text}`}>
                                                            {initials}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-slate-900 dark:text-white">{cleanName}</p>
                                                            <p className="text-[10px] text-slate-500">S.No: {patient.VisitID} • {patient.Sex || 'Unknown'}, {patient.Age || '?'}y</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className="px-4 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Completed</span>
                                                </td>
                                                <td className="px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400">General Checkup</td>
                                                <td className="px-6 py-3 text-xs text-slate-500">{formattedDate}</td>
                                                <td className="px-6 py-3 text-right rounded-r-2xl">
                                                    <button className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-400 hover:text-emerald-500 transition-all">
                                                        <span className="material-symbols-outlined text-lg">more_horiz</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-8 text-slate-500">No recent patients found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>

                {/* Floating Action Button */}
                <button onClick={() => navigate('/new-patient')} className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group z-30">
                    <span className="material-symbols-outlined text-2xl">add</span>
                    <span className="absolute right-16 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl">New Patient</span>
                </button>

            </div>
        </div>
    );
};

export default Home;