import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    // Dashboard Data State
    const [patients, setPatients] = useState([]);
    const [stats, setStats] = useState({ patientsToday: 0, newRegistrations: 0, testsPrescribed: 0, dailyRevenue: 0 });

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientHistory, setPatientHistory] = useState([]);
    const [historyLoading] = useState(false);

    // Fetch Initial Dashboard Data
    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('doctorToken');
            if (!token) return;
            try {
                const [patientsRes, statsRes] = await Promise.all([
                    fetch('https://patient-record-app-drly.onrender.com/api/patients/recent', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('https://patient-record-app-drly.onrender.com/api/stats', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                const patientsData = await patientsRes.json();
                const statsData = await statsRes.json();

                // BULLETPROOFING: Added '|| []' so it never becomes undefined
                if (patientsData.success) setPatients(patientsData.patients || []);
                if (statsData.success) setStats(statsData.stats || { patientsToday: 0, newRegistrations: 0, testsPrescribed: 0, dailyRevenue: 0 });
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // REAL-TIME SEARCH LOGIC (Debounced)
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        const delaySearch = setTimeout(async () => {
            const token = localStorage.getItem('doctorToken');
            try {
                const res = await fetch(`https://patient-record-app-drly.onrender.com/api/patients/search?q=${searchQuery}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    // BULLETPROOFING: Ensure searchResults is always an array
                    setSearchResults(data.results || []);
                    setShowDropdown(true);
                }
            } catch (e) { console.error("Search failed:", e); }
        }, 300); 

        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    // FETCH HISTORY & OPEN MODAL
    // --- UPDATED: SMART FETCH HISTORY & REDIRECT ---
    const handlePatientClick = async (patient) => {
        setShowDropdown(false);
        setSearchQuery('');
        
        console.log("1. Clicked Patient Data:", patient); // DEBUG

        const token = localStorage.getItem('doctorToken');
        try {
            const url = `https://patient-record-app-drly.onrender.com/api/patients/history?mobile=${patient.Mobile || ''}&name=${patient.PatientName}`;
            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            
            console.log("2. History Results from DB:", data); // DEBUG

            if (data.success && data.history && data.history.length > 1) {
                console.log("3. Multiple visits found! Opening Modal."); // DEBUG
                setSelectedPatient(patient);
                setPatientHistory(data.history);
                setIsModalOpen(true);
            } else {
                console.log("3. One visit found (or none). Navigating directly."); // DEBUG
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

    const goToVisit = (visitId) => {
        navigate(`/old-patient?id=${visitId}`);
    };

    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}, ${date.getFullYear()}`;
    };

    const avatarThemes = [{ bg: '#fcd34d', text: '#b45309' }, { bg: '#10b981', text: 'white' }, { bg: '#64748b', text: 'white' }, { bg: '#f43f5e', text: 'white' }];

    return (
        <>
            {/* SEARCH ROW */}
            <div className="search-row">
                <div className="search-container">
                    <svg className="search-icon" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Search Patients by Name or Mobile Number..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        // BULLETPROOFING: Added optional chaining (?)
                        onFocus={() => { if (searchResults?.length > 0) setShowDropdown(true); }}
                    />

                    {/* DYNAMIC SEARCH DROPDOWN */}
                    {showDropdown && (
                        <div className="search-dropdown">
                            {/* BULLETPROOFING: Safe length check */}
                            {(!searchResults || searchResults.length === 0) ? (
                                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No patients found.</div>
                            ) : (
                                searchResults.map((result, index) => (
                                    // Ensure key is absolutely unique by appending index if VisitID is missing
                                    <div key={result.VisitID || index} className="search-result-item" onClick={() => handlePatientClick(result)}>
                                        <div>
                                            <div className="search-name">{result.PatientName}</div>
                                            <div className="search-sub">Father: {result.FatherName || 'N/A'}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div className="search-name" style={{ color: 'var(--primary)' }}>{result.Mobile || 'No Number'}</div>
                                            <div className="search-sub">Last Visit: {formatDate(result.VisitDate)}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
                
                <button className="btn-new-patient" onClick={() => navigate('/new-patient')}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                    New patient
                </button>
            </div>

            {/* MAIN CARDS */}
            <div className="cards-row">
                
                <div className="data-card dynamic-height-card">
                    <div className="card-header">Recent Patients</div>
                    <div className="list-headers">
                        <span>Profile</span>
                        <span>Last visit</span>
                    </div>
                    
                    <div className="list-body">
                        {loading && <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}
                        {/* BULLETPROOFING: Safe mapping */}
                        {!loading && patients && patients.map((patient, index) => {
                            const theme = avatarThemes[index % avatarThemes.length];
                            return (
                                <div key={patient.VisitID || index} className="list-item" onClick={() => handlePatientClick(patient)}>
                                    <div className="profile-col">
                                        <div className="avatar" style={{ background: theme.bg, color: theme.text }}>{getInitials(patient.PatientName)}</div>
                                        <div>
                                            <div className="item-name">{patient.PatientName}</div>
                                            <div className="item-sub">S.No: {patient.VisitID}</div>
                                        </div>
                                    </div>
                                    <div className="date-col">Last visit<br/>{formatDate(patient.VisitDate)}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* OVERVIEW STATS */}
                <div className="stats-container">
                    <h3 className="card-header" style={{ marginBottom: '1.5rem' }}>Today's Overview</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon icon-blue"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg></div>
                            <div className="stat-title">Patients Today</div>
                            <div className="stat-value">{stats.patientsToday}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon icon-green"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle></svg></div>
                            <div className="stat-title">New Registrations</div>
                            <div className="stat-value">{stats.newRegistrations}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon icon-orange"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h4l2-9 5 18 3-9h5"></path></svg></div>
                            <div className="stat-title">Tests Prescribed</div>
                            <div className="stat-value">{stats.testsPrescribed}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon icon-purple"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div>
                            <div className="stat-title">Daily Revenue</div>
                            <div className="stat-value">₹{Number(stats.dailyRevenue).toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PATIENT HISTORY MODAL */}
            {isModalOpen && selectedPatient && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div>
                                <h2>{selectedPatient.PatientName}'s History</h2>
                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                                    Father: {selectedPatient.FatherName || 'N/A'} | Mobile: {selectedPatient.Mobile || 'N/A'}
                                </span>
                            </div>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>

                        {historyLoading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading records...</div>
                        ) : (
                            <div className="history-list">
                                {/* BULLETPROOFING: Safe length check */}
                                {(!patientHistory || patientHistory.length === 0) ? (
                                    <div style={{ textAlign: 'center', padding: '1rem' }}>No history found.</div>
                                ) : (
                                    patientHistory.map((visit, index) => (
                                        <div key={visit.VisitID || index} className="history-item" onClick={() => goToVisit(visit.VisitID)}>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                                                    Visit Date: {formatDate(visit.VisitDate)}
                                                </div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                                                    Visit ID: {visit.VisitID}
                                                </div>
                                            </div>
                                            <div style={{ color: 'var(--primary)', fontWeight: 700 }}>
                                                View Details →
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Home;