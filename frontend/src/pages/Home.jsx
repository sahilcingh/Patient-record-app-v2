import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/dashboard.css';

const Home = () => {
    const navigate = useNavigate();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    // --- UPDATED STATS STATE TO HOLD TRENDS ---
    const [stats, setStats] = useState({
        patientsToday: 0, patientsTrend: 0,
        newRegistrations: 0, registrationsTrend: 0,
        testsPrescribed: 0, testsTrend: 0,
        dailyRevenue: 0, revenueTrend: 0
    });
    
    const [recentPatients, setRecentPatients] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientHistory, setPatientHistory] = useState([]);

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

    const getAvatarColor = (index) => {
        const colors = ['#fbbf24', '#10b981', '#64748b', '#f43f5e', '#facc15', '#3b82f6'];
        return colors[index % colors.length];
    };

    // --- NEW: DYNAMIC TREND UI RENDERER ---
    const renderTrend = (trendValue, text) => {
        const value = parseFloat(trendValue);
        const isPositive = value >= 0;
        const color = isPositive ? '#10b981' : '#ef4444'; // Green for up, Red for down
        const arrow = isPositive ? '↗' : '↘';
        const sign = isPositive && value !== 0 ? '+' : '';
        
        return (
            <div style={{ fontSize: '0.85rem', color: color, fontWeight: '600' }}>
                {arrow} {sign}{value}% {text}
            </div>
        );
    };

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
                if (statsData.success) setStats(statsData.stats); // Updates values + trends

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

    const handlePatientClick = async (patient) => {
        setShowDropdown(false); setSearchQuery('');
        const token = localStorage.getItem('doctorToken');
        try {
            const res = await fetch(`https://patient-record-app-drly.onrender.com/api/patients/history?mobile=${patient.Mobile || ''}&name=${encodeURIComponent(patient.PatientName)}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) { handleAuthError(res.status); return; }
            const data = await res.json();
            if (data.success && data.history && data.history.length > 1) {
                setSelectedPatient(patient); setPatientHistory(data.history); setIsModalOpen(true);
            } else {
                const targetVisitId = (data.history && data.history.length === 1) ? data.history[0].VisitID : patient.VisitID; 
                navigate(`/old-patient?id=${targetVisitId}`);
            }
        } catch (e) { navigate(`/old-patient?id=${patient.VisitID}`); }
    };

    return (
        <>
            <div className="search-row" style={{ marginBottom: '2rem' }}>
                <div className="search-container" style={{ flex: 1, position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '12px', padding: '0.8rem 1.2rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <svg width="20" height="20" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input type="text" placeholder="Search Patients by Name or Mobile Number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', marginLeft: '12px', width: '100%', color: '#0f172a', fontSize: '1rem' }} />
                    </div>
                    {showDropdown && searchResults.length > 0 && (
                        <div className="search-dropdown" style={{ position: 'absolute', top: '110%', left: 0, right: 0, backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 50, overflow: 'hidden' }}>
                            {searchResults.map((patient, index) => (
                                <div key={index} className="search-result-item" onClick={() => handlePatientClick(patient)} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{formatName(patient.PatientName)}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{patient.Mobile || 'No Mobile'} • {formatName(patient.FatherName) || 'No Father Name'}</div>
                                    </div>
                                    <div style={{ color: '#10b981', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>View Record →</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button onClick={() => navigate('/new-patient')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem', marginLeft: '1rem', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    New patient
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                {/* --- RECENT PATIENTS LIST --- */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '1.5rem 1.5rem 0.5rem 1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0, marginBottom: '1.5rem' }}>Recent Patients</h2>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>Profile</span>
                            <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>Last visit</span>
                        </div>
                    </div>

                    <div style={{ padding: '0 1.5rem' }}>
                        {recentPatients.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No recent patients found.</div>
                        ) : (
                            recentPatients.map((patient, index) => {
                                const dateObj = new Date(patient.VisitDate);
                                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                const formattedDate = `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]}, ${dateObj.getFullYear()}`;
                                const cleanName = formatName(patient.PatientName);
                                const initials = getInitials(cleanName);

                                return (
                                    <div key={index} onClick={() => handlePatientClick(patient)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', margin: '0.25rem -1rem', borderRadius: '12px', borderBottom: index !== recentPatients.length - 1 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3e8ff'; e.currentTarget.style.boxShadow = 'inset 0 0 0 1px #d8b4fe'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ backgroundColor: getAvatarColor(index), color: 'white', fontWeight: 'bold', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{initials}</div>
                                            <div>
                                                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.05rem', marginBottom: '0.15rem' }}>{cleanName}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>S.No: {patient.VisitID}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.15rem' }}>Last visit</div>
                                            <div style={{ fontWeight: '500', color: '#0f172a', fontSize: '0.95rem' }}>{formattedDate}</div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                    <div style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', padding: '1rem', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                        <button onClick={() => navigate('/patients')} style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#059669'} onMouseLeave={e => e.target.style.color = '#10b981'}>View All Patients</button>
                    </div>
                </div>

                {/* --- TODAY'S OVERVIEW STATS (Now with Dynamic Trends!) --- */}
                <div>
                    <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0, marginBottom: '1.5rem' }}>Today's Overview</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        
                        {/* Patients Today */}
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e0f2fe', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.1)', position: 'relative', overflow: 'hidden' }}>
                            <svg style={{ position: 'absolute', right: '-15px', bottom: '10px', opacity: 0.05, width: '100px', height: '100px', color: '#0ea5e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                            <div style={{ backgroundColor: '#e0f2fe', color: '#0ea5e9', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}><svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Patients Today</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a' }}>{stats.patientsToday}</div>
                                {/* Dynamic Render Here */}
                                {renderTrend(stats.patientsTrend, 'from yesterday')}
                            </div>
                        </div>

                        {/* New Registrations */}
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #d1fae5', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.1)', position: 'relative', overflow: 'hidden' }}>
                            <svg style={{ position: 'absolute', right: '-10px', bottom: '10px', opacity: 0.05, width: '90px', height: '90px', color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            <div style={{ backgroundColor: '#d1fae5', color: '#10b981', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}><svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg></div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Visits This Week</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a' }}>{stats.newRegistrations}</div>
                                {renderTrend(stats.registrationsTrend, 'from last wk')}
                            </div>
                        </div>

                        {/* Tests Prescribed */}
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #ffedd5', boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.1)', position: 'relative', overflow: 'hidden' }}>
                            <svg style={{ position: 'absolute', right: '0px', bottom: '0px', opacity: 0.05, width: '100px', height: '100px', color: '#f97316', transform: 'rotate(-15deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                            <div style={{ backgroundColor: '#ffedd5', color: '#f97316', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}><svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg></div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Tests This Week</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a' }}>{stats.testsPrescribed}</div>
                                {renderTrend(stats.testsTrend, 'from last wk')}
                            </div>
                        </div>

                        {/* Daily Revenue */}
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #f3e8ff', boxShadow: '0 4px 6px -1px rgba(168, 85, 247, 0.1)', position: 'relative', overflow: 'hidden' }}>
                            <svg style={{ position: 'absolute', right: '-5px', bottom: '0px', opacity: 0.05, width: '90px', height: '90px', color: '#a855f7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <div style={{ backgroundColor: '#f3e8ff', color: '#a855f7', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}><svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Daily Revenue</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a' }}>₹{stats.dailyRevenue}</div>
                                {renderTrend(stats.revenueTrend, 'monthly trend')}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* --- HISTORY MODAL --- */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{formatName(selectedPatient?.PatientName)}'s Visit History</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <div className="history-list">
                            {patientHistory.map((visit, index) => {
                                const vDate = new Date(visit.VisitDate);
                                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                const formattedVDate = `${vDate.getDate()} ${monthNames[vDate.getMonth()]}, ${vDate.getFullYear()}`;
                                return (
                                    <div key={index} className="history-item" onClick={() => navigate(`/old-patient?id=${visit.VisitID}`)} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#eff6ff'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = 'transparent'; }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.25rem' }}>{formattedVDate}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Visit #{visit.VisitID}</div>
                                        </div>
                                        <div style={{ color: '#3b82f6', fontWeight: 600 }}>View Report →</div>
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