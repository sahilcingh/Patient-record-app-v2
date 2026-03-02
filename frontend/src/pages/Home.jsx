import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/dashboard.css';

const Home = () => {
    const navigate = useNavigate();
    
    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    // Dashboard Data State
    const [stats, setStats] = useState({
        patientsToday: 0,
        newRegistrations: 0,
        testsPrescribed: 0,
        dailyRevenue: 0
    });
    const [recentPatients, setRecentPatients] = useState([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientHistory, setPatientHistory] = useState([]);

    // --- AUTHENTICATION HELPER ---
    // Instantly logs the user out if their 8-hour token has expired
    const handleAuthError = (status) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem('doctorToken');
            localStorage.removeItem('doctorName');
            localStorage.removeItem('dbName');
            navigate('/');
        }
    };

    // --- FETCH DASHBOARD DATA (Stats & Recent Patients) ---
    useEffect(() => {
        const token = localStorage.getItem('doctorToken');
        if (!token) {
            navigate('/');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                // Fetch Stats
                const statsRes = await fetch('https://patient-record-app-drly.onrender.com/api/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (!statsRes.ok) {
                    handleAuthError(statsRes.status);
                    return;
                }
                const statsData = await statsRes.json();
                if (statsData.success) setStats(statsData.stats);

                // Fetch Recent Patients
                const recentRes = await fetch('https://patient-record-app-drly.onrender.com/api/patients/recent', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!recentRes.ok) {
                    handleAuthError(recentRes.status);
                    return;
                }
                const recentData = await recentRes.json();
                if (recentData.success) setRecentPatients(recentData.patients);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    // --- FETCH SEARCH RESULTS (Debounced) ---
    useEffect(() => {
        const token = localStorage.getItem('doctorToken');
        
        const fetchSearchResults = async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                setShowDropdown(false);
                return;
            }

            try {
                const res = await fetch(`https://patient-record-app-drly.onrender.com/api/patients/search?q=${encodeURIComponent(searchQuery)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) {
                    handleAuthError(res.status);
                    return;
                }

                const data = await res.json();
                if (data.success) {
                    setSearchResults(data.results);
                    setShowDropdown(true);
                }
            } catch (error) {
                console.error("Search error:", error);
            }
        };

        // Debounce: Wait 300ms after typing stops before searching
        const delayDebounceFn = setTimeout(() => {
            fetchSearchResults();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, navigate]);

    // --- SMART CLICK: FETCH HISTORY & REDIRECT ---
    const handlePatientClick = async (patient) => {
        setShowDropdown(false);
        setSearchQuery('');
        
        const token = localStorage.getItem('doctorToken');
        try {
            const url = `https://patient-record-app-drly.onrender.com/api/patients/history?mobile=${patient.Mobile || ''}&name=${encodeURIComponent(patient.PatientName)}`;
            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            
            if (!res.ok) {
                handleAuthError(res.status);
                return;
            }

            const data = await res.json();
            
            if (data.success && data.history && data.history.length > 1) {
                // Multiple visits: Open Modal
                setSelectedPatient(patient);
                setPatientHistory(data.history);
                setIsModalOpen(true);
            } else {
                // Only one visit: Bypass modal & jump to record
                const targetVisitId = (data.history && data.history.length === 1) 
                    ? data.history[0].VisitID 
                    : patient.VisitID; 
                
                navigate(`/old-patient?id=${targetVisitId}`);
            }
        } catch (e) {
            console.error("History fetch failed:", e);
            navigate(`/old-patient?id=${patient.VisitID}`);
        }
    };

    return (
        <>
            {/* --- SEARCH BAR --- */}
            <div className="search-row">
                <div className="search-container">
                    <svg className="search-icon" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Search Patients by Name or Mobile Number..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    
                    {/* Search Dropdown */}
                    {showDropdown && searchResults.length > 0 && (
                        <div className="search-dropdown">
                            {searchResults.map((patient, index) => (
                                <div key={index} className="search-result-item" onClick={() => handlePatientClick(patient)}>
                                    <div>
                                        <div className="search-name">{patient.PatientName}</div>
                                        <div className="search-sub">{patient.Mobile || 'No Mobile'} • {patient.FatherName || 'No Father Name'}</div>
                                    </div>
                                    <div style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                                        View Record →
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button className="btn-new-patient" onClick={() => navigate('/new-patient')}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    New patient
                </button>
            </div>

            <div className="cards-row">
                
                {/* --- RECENT PATIENTS LIST --- */}
                <div className="data-card dynamic-height-card">
                    <div className="card-header">Recent Patients</div>
                    <div className="list-headers">
                        <span>Profile</span>
                        <span>Last visit</span>
                    </div>
                    <div>
                        {recentPatients.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No recent patients found.</div>
                        ) : (
                            recentPatients.map((patient, index) => {
                                const dateObj = new Date(patient.VisitDate);
                                const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
                                
                                return (
                                    <div key={index} className="list-item" onClick={() => handlePatientClick(patient)}>
                                        <div className="profile-col">
                                            <div className="avatar" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                                                {patient.PatientName ? patient.PatientName.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <div className="item-name">{patient.PatientName}</div>
                                            </div>
                                        </div>
                                        <div className="date-col">
                                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formattedDate}</div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* --- TODAY'S OVERVIEW STATS --- */}
                <div className="stats-container">
                    <h2 className="card-header" style={{ marginBottom: '1.5rem' }}>Today's Overview</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon icon-blue">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            </div>
                            <div className="stat-title">Patients Today</div>
                            <div className="stat-value">{stats.patientsToday}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon icon-green">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                            </div>
                            <div className="stat-title">New Registrations</div>
                            <div className="stat-value">{stats.newRegistrations}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon icon-orange">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                            </div>
                            <div className="stat-title">Tests Prescribed</div>
                            <div className="stat-value">{stats.testsPrescribed}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon icon-purple">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <div className="stat-title">Daily Revenue</div>
                            <div className="stat-value">₹{stats.dailyRevenue}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- HISTORY MODAL --- */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedPatient?.PatientName}'s Visit History</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <div className="history-list">
                            {patientHistory.map((visit, index) => {
                                const vDate = new Date(visit.VisitDate);
                                const formattedVDate = `${String(vDate.getDate()).padStart(2, '0')}-${String(vDate.getMonth() + 1).padStart(2, '0')}-${vDate.getFullYear()}`;
                                
                                return (
                                    <div 
                                        key={index} 
                                        className="history-item"
                                        onClick={() => navigate(`/old-patient?id=${visit.VisitID}`)}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                                                {formattedVDate}
                                            </div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                                                Visit #{visit.VisitID}
                                            </div>
                                        </div>
                                        <div style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                            View Report →
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Home;