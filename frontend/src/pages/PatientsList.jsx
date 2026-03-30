import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/dashboard.css';
import '../css/patients.css'; 

const PatientsList = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // Theme & Doctor Profile
    const [isDark, setIsDark] = useState(() => localStorage.getItem('darkMode') === 'true');
    const [doctorProfile, setDoctorProfile] = useState({
        name: localStorage.getItem('doctorName') || 'Loading...',
        designation: 'Loading...'
    });

    // Toolbar States
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); 
    
    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [patientHistory, setPatientHistory] = useState([]);
    const [selectedPatientName, setSelectedPatientName] = useState('');

    // --- FETCH DATA ---
    useEffect(() => {
        const token = localStorage.getItem('doctorToken');
        if (!token) { navigate('/'); return; }

        const fetchData = async () => {
            try {
                const profileRes = await fetch('https://patient-record-app-drly.onrender.com/api/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    if (profileData.success) {
                        setDoctorProfile({
                            name: profileData.profile.DoctorName || localStorage.getItem('doctorName') || 'Doctor',
                            designation: profileData.profile.DoctorDesi || 'Medical Professional'
                        });
                    }
                }

                const patientsRes = await fetch('https://patient-record-app-drly.onrender.com/api/patients/unique', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const patientsData = await patientsRes.json();
                if (patientsData.success) {
                    setPatients(patientsData.patients);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // --- FILTER LOGIC ---
    const filteredPatients = useMemo(() => {
        return patients.filter(p => {
            const matchesSearch = (p.PatientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                                  (p.Mobile || '').includes(searchTerm);
            if (!matchesSearch) return false;

            if (activeTab === 'frequent') return p.VisitCount > 1;
            if (activeTab === 'recent') {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return new Date(p.LastVisitDate) >= thirtyDaysAgo;
            }
            return true;
        });
    }, [patients, searchTerm, activeTab]);

    // --- HELPER FUNCTIONS ---
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

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const d = new Date(dateString);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${d.getDate()} ${monthNames[d.getMonth()]}, ${d.getFullYear()}`;
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

    const handleExportCSV = () => {
        const headers = ['Patient Name', 'Contact Number', 'Last Visit Date', 'Total Visits'];
        const csvData = filteredPatients.map(p => `"${formatName(p.PatientName)}","${p.Mobile || 'N/A'}","${formatDate(p.LastVisitDate)}","${p.VisitCount}"`);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...csvData].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Clinic_Patient_Directory.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRowClick = async (patient) => {
        if (patient.VisitCount === 1) {
            navigate(`/old-patient?id=${patient.LatestVisitID}`);
        } else {
            setSelectedPatientName(formatName(patient.PatientName));
            setIsModalOpen(true);
            setHistoryLoading(true);
            const token = localStorage.getItem('doctorToken');
            try {
                const res = await fetch(`https://patient-record-app-drly.onrender.com/api/patients/history?mobile=${patient.Mobile}&name=${patient.PatientName}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) setPatientHistory(data.history);
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setHistoryLoading(false);
            }
        }
    };

    return (
        <div className="dashboard-wrapper" data-theme={isDark ? 'dark' : 'light'}>
            
            {/* SIDEBAR */}
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
                        <img alt="Doctor" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAA5LdANAUa2KwGpdHFThaxvz60QKnY86uujQYa7kzWemiV_fYEzTS1PoWpGtqeox60pgP_fkrcvuXwaifghpeWF1KDw9U3J7BjuhgrSl8gS639_AGaBFa2OOogt-nEZXMeVPG6P8fHux0KNrfQYe44O8ZUsEzh3iq6zsTBVBytXS6vQ-M4d1GWNuUn5wGyvO7nhHKKOMIUTEix065iYxbzJHC94q2oQMKFeok6YMNnhOQxZzwkUwEpNQUmpFjnEUvlCH2crqTLBQ" />
                    </div>
                    {isSidebarOpen && (
                        <div className="doctor-info">
                            <p className="doctor-name">{doctorProfile.name}</p>
                            <p className="doctor-title">{doctorProfile.designation}</p>
                        </div>
                    )}
                </div>

                <nav className="sidebar-nav">
                    <button className="nav-item" onClick={() => navigate('/home')}>
                        <span className="material-symbols-outlined">dashboard</span>
                        {isSidebarOpen && <span>Dashboard</span>}
                    </button>
                    <button className="nav-item active">
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
                    <button className="nav-item" onClick={() => navigate('/profile')}>
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

            {/* MAIN CONTENT */}
            <main className="main-content patients-main">
                <header className="page-header">
                    <h1>Patient Directory</h1>
                    <div className="total-badge">Total Unique Patients: <span>{patients.length}</span></div>
                </header>

                <div className="smart-toolbar glass-panel">
                    <div className="search-bar">
                        <span className="material-symbols-outlined">search</span>
                        <input 
                            type="text" 
                            placeholder="Search by name or mobile..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="toolbar-actions">
                        <div className="filter-tabs">
                            <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Patients</button>
                            <button className={`tab-btn ${activeTab === 'frequent' ? 'active' : ''}`} onClick={() => setActiveTab('frequent')}>Frequent (2+ Visits)</button>
                            <button className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`} onClick={() => setActiveTab('recent')}>Recent (30 Days)</button>
                        </div>

                        <button className="btn-export" onClick={handleExportCSV}>
                            <span className="material-symbols-outlined">download</span> Export CSV
                        </button>
                    </div>
                </div>

                {/* PATIENTS LIST CONTAINER */}
                <div className="patient-list-container glass-panel">
                    <div className="list-header-row">
                        <div className="col-profile">PATIENT DETAILS</div>
                        <div className="col-contact">CONTACT NUMBER</div>
                        <div className="col-date">LAST VISIT</div>
                        <div className="col-visits">TOTAL VISITS</div>
                        <div className="col-action"></div>
                    </div>

                    {/* SCROLLABLE LIST BODY */}
                    <div className="list-body custom-scrollbar">
                        {loading ? (
                            <div className="empty-state">Loading directory...</div>
                        ) : filteredPatients.length > 0 ? (
                            filteredPatients.map((p, index) => {
                                const cleanName = formatName(p.PatientName);
                                return (
                                    <div key={index} className="patient-row" onClick={() => handleRowClick(p)}>
                                        <div className="col-profile">
                                            <div className={`patient-avatar avatar-${index % 5}`}>{getInitials(cleanName)}</div>
                                            <div className="patient-info">
                                                <h4>{cleanName}</h4>
                                                <p>Recent ID: #{p.LatestVisitID}</p>
                                            </div>
                                        </div>
                                        <div className="col-contact">{p.Mobile || 'N/A'}</div>
                                        <div className="col-date">{formatDate(p.LastVisitDate)}</div>
                                        <div className="col-visits">
                                            <span className="visit-pill">{p.VisitCount} {p.VisitCount === 1 ? 'Visit' : 'Visits'}</span>
                                        </div>
                                        <div className="col-action">
                                            <span className="material-symbols-outlined nav-arrow">chevron_right</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty-state">No patients match your filters.</div>
                        )}
                    </div>

                    {/* SIMPLIFIED FOOTER */}
                    <div className="pagination-footer" style={{ justifyContent: 'center' }}>
                        <p className="showing-text">
                            Showing <strong>{filteredPatients.length}</strong> patients
                        </p>
                    </div>
                </div>
            </main>

            {/* --- MODALS --- */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Visit History: {selectedPatientName}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
                        </div>
                        {historyLoading ? (
                            <p className="text-center">Loading history...</p>
                        ) : (
                            <div className="history-list custom-scrollbar">
                                {patientHistory.map((visit) => (
                                    <div key={visit.VisitID} className="history-item" onClick={() => navigate(`/old-patient?id=${visit.VisitID}`)}>
                                        <div>
                                            <div className="history-date">{formatDate(visit.VisitDate)}</div>
                                            <div className="history-id">Visit ID: #{visit.VisitID}</div>
                                        </div>
                                        <div className="history-action text-primary">
                                            View Report <span className="material-symbols-outlined">arrow_forward</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientsList;