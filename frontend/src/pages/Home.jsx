import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/dashboard.css';

const Home = () => {
    const navigate = useNavigate();
    
    // --- STATE MANAGEMENT ---
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
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
        return name.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const getInitials = (name) => {
        if (!name || name === "Unknown") return "?";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem('darkMode', newTheme);
    };

    const handleLogout = () => {
        localStorage.removeItem('doctorToken');
        navigate('/');
    };

    // --- DATA FETCHING ---
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
        <div className="dashboard-wrapper" data-theme={isDark ? 'dark' : 'light'}>
            
            {/* --- SIDEBAR --- */}
            <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <button className="menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    {isSidebarOpen && (
                        <div className="logo">
                            <span className="material-symbols-outlined logo-icon">medical_services</span>
                            <span className="logo-text">MediFlow</span>
                        </div>
                    )}
                </div>

                <div className="sidebar-profile">
                    <div className="doctor-avatar">
                        <img alt="Doctor profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAA5LdANAUa2KwGpdHFThaxvz60QKnY86uujQYa7kzWemiV_fYEzTS1PoWpGtqeox60pgP_fkrcvuXwaifghpeWF1KDw9U3J7BjuhgrSl8gS639_AGaBFa2OOogt-nEZXMeVPG6P8fHux0KNrfQYe44O8ZUsEzh3iq6zsTBVBytXS6vQ-M4d1GWNuUn5wGyvO7nhHKKOMIUTEix065iYxbzJHC94q2oQMKFeok6YMNnhOQxZzwkUwEpNQUmpFjnEUvlCH2crqTLBQ" />
                    </div>
                    {isSidebarOpen && (
                        <div className="doctor-info">
                            <p className="doctor-name">Dr. S.S. Gupta</p>
                            <p className="doctor-title">Cardiologist</p>
                        </div>
                    )}
                </div>

                <nav className="sidebar-nav">
                    <button className="nav-item active">
                        <span className="material-symbols-outlined">dashboard</span>
                        {isSidebarOpen && <span>Dashboard</span>}
                    </button>
                    <button className="nav-item" onClick={() => navigate('/patients')}>
                        <span className="material-symbols-outlined">group</span>
                        {isSidebarOpen && <span>Patients</span>}
                    </button>
                    <button className="nav-item" onClick={() => navigate('/new-patient')}>
                        <span className="material-symbols-outlined">add_circle</span>
                        {isSidebarOpen && <span>New Patient</span>}
                    </button>
                    <button className="nav-item">
                        <span className="material-symbols-outlined">assessment</span>
                        {isSidebarOpen && <span>Reports</span>}
                    </button>
                    <button className="nav-item">
                        <span className="material-symbols-outlined">calendar_today</span>
                        {isSidebarOpen && <span>Appointments</span>}
                    </button>
                    <button className="nav-item">
                        <span className="material-symbols-outlined">settings</span>
                        {isSidebarOpen && <span>Settings</span>}
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="theme-toggle-container">
                        <div className="toggle-switch" onClick={toggleTheme}>
                            <input type="checkbox" checked={isDark} readOnly />
                            <span className="slider"></span>
                        </div>
                        {isSidebarOpen && <span className="toggle-label">Dark Mode</span>}
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <span className="material-symbols-outlined">logout</span>
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="main-content">
                <header className="top-header">
                    <div className="welcome-text">
                        <h1>Welcome back, Dr. Gupta</h1>
                        <p>Manage your practice and patients efficiently.</p>
                    </div>
                    
                    <div className="search-section">
                        <div className="search-box glass-panel">
                            <span className="material-symbols-outlined search-icon">search</span>
                            <input 
                                type="text" 
                                placeholder="Search patients or records..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <kbd>⌘K</kbd>
                        </div>

                        {showDropdown && searchResults.length > 0 && (
                            <div className="search-dropdown">
                                {searchResults.map((patient, index) => (
                                    <div key={index} onClick={() => navigate(`/old-patient?id=${patient.VisitID}`)} className="search-result-item">
                                        <div>
                                            <div className="search-name">{formatName(patient.PatientName)}</div>
                                            <div className="search-sub">{patient.Mobile || 'No Mobile'}</div>
                                        </div>
                                        <div className="search-action">View →</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </header>

                {/* STATS ROW */}
                <section className="stats-grid">
                    <div className="stat-card glass-panel card-blue">
                        <div className="stat-icon"><span className="material-symbols-outlined">person</span></div>
                        <div className="stat-info">
                            <div className="stat-header">
                                <h3>Patients Today</h3>
                                <span className="badge positive">+12%</span>
                            </div>
                            <div className="stat-values">
                                <h2>{stats.patientsToday || 42}</h2>
                                <p>vs 34</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card glass-panel card-purple">
                        <div className="stat-icon"><span className="material-symbols-outlined">event_available</span></div>
                        <div className="stat-info">
                            <div className="stat-header">
                                <h3>Weekly Visits</h3>
                                <span className="badge negative">-4%</span>
                            </div>
                            <div className="stat-values">
                                <h2>{stats.newRegistrations || 186}</h2>
                                <p>vs 194</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card glass-panel card-orange">
                        <div className="stat-icon"><span className="material-symbols-outlined">science</span></div>
                        <div className="stat-info">
                            <div className="stat-header">
                                <h3>Tests Pending</h3>
                                <span className="badge positive">+8%</span>
                            </div>
                            <div className="stat-values">
                                <h2>{stats.testsPrescribed || 12}</h2>
                                <p>4 urgent</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card glass-panel card-mint">
                        <div className="stat-icon"><span className="material-symbols-outlined">payments</span></div>
                        <div className="stat-info">
                            <div className="stat-header">
                                <h3>Daily Revenue</h3>
                                <span className="badge positive">+18%</span>
                            </div>
                            <div className="stat-values">
                                <h2>${stats.dailyRevenue || '2,840'}</h2>
                                <p>from 24</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* RECENT PATIENTS TABLE */}
                <section className="recent-patients-panel glass-panel">
                    <div className="panel-header">
                        <h2>Recent Patients</h2>
                        <button className="view-all-btn" onClick={() => navigate('/patients')}>
                            View All <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                    
                    <div className="table-container custom-scrollbar">
                        <table>
                            <thead>
                                <tr>
                                    <th>Patient Profile</th>
                                    <th className="text-center">Status</th>
                                    <th>Appointment</th>
                                    <th>Last Visit</th>
                                    <th className="text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPatients.length > 0 ? recentPatients.map((patient, index) => {
                                    const dateObj = new Date(patient.VisitDate);
                                    const formattedDate = `${dateObj.getDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][dateObj.getMonth()]}, ${dateObj.getFullYear()}`;
                                    const cleanName = formatName(patient.PatientName);

                                    return (
                                        <tr key={index} onClick={() => navigate(`/old-patient?id=${patient.VisitID}`)}>
                                            <td>
                                                <div className="patient-cell">
                                                    <div className={`avatar avatar-${index % 5}`}>{getInitials(cleanName)}</div>
                                                    <div>
                                                        <p className="patient-name">{cleanName}</p>
                                                        <p className="patient-sub">S.No: {patient.VisitID} • {patient.Sex || 'Unknown'}, {patient.Age || '?'}y</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className="status-badge completed">Completed</span>
                                            </td>
                                            <td>General Checkup</td>
                                            <td>{formattedDate}</td>
                                            <td className="text-right">
                                                <button className="action-btn"><span className="material-symbols-outlined">more_horiz</span></button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan="5" className="empty-state">No recent patients found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            <button className="fab-add" onClick={() => navigate('/new-patient')}>
                <span className="material-symbols-outlined">add</span>
            </button>
        </div>
    );
};

export default Home;