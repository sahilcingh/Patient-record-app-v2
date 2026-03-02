import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientsList = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- NEW: Smart Toolbar States ---
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'recent', 'frequent'

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [patientHistory, setPatientHistory] = useState([]);
    const [selectedPatientName, setSelectedPatientName] = useState('');

    // --- HELPER FUNCTIONS ---
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
        const colors = ['#facc15', '#10b981', '#64748b', '#f43f5e', '#fbbf24', '#3b82f6'];
        return colors[index % colors.length];
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const d = new Date(dateString);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${d.getDate()} ${monthNames[d.getMonth()]}, ${d.getFullYear()}`;
    };

    // --- FETCH DATA ---
    useEffect(() => {
        fetchUniquePatients();
    }, []);

    const fetchUniquePatients = async () => {
        const token = localStorage.getItem('doctorToken');
        try {
            const res = await fetch('https://patient-record-app-drly.onrender.com/api/patients/unique', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPatients(data.patients);
            }
        } catch (err) {
            console.error("Error fetching patients:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- NEW: Filter Logic for the Toolbar ---
    const filteredPatients = patients.filter(p => {
        // 1. Search Logic
        const matchesSearch = (p.PatientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                              (p.Mobile || '').includes(searchTerm);
        if (!matchesSearch) return false;

        // 2. Tab Logic
        if (activeTab === 'frequent') return p.VisitCount > 1;
        if (activeTab === 'recent') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return new Date(p.LastVisitDate) >= thirtyDaysAgo;
        }
        
        return true; // 'all' tab
    });

    // --- NEW: Export to CSV feature ---
    const handleExportCSV = () => {
        const headers = ['Patient Name', 'Contact Number', 'Last Visit Date', 'Total Visits'];
        const csvData = filteredPatients.map(p => 
            `"${formatName(p.PatientName)}","${p.Mobile || 'N/A'}","${formatDate(p.LastVisitDate)}","${p.VisitCount}"`
        );
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
                if (data.success) {
                    setPatientHistory(data.history);
                }
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setHistoryLoading(false);
            }
        }
    };

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Patient Directory...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* ORIGINAL HEADER (Untouched) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="page-title" style={{ margin: 0, fontSize: '2rem', color: '#1e293b' }}>Patient Directory</h1>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>
                    Total Unique Patients: {patients.length}
                </div>
            </div>

            {/* --- NEW SMART TOOLBAR (Fills the empty space creatively) --- */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '1rem 1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                
                {/* Search Input */}
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '10px', padding: '0.6rem 1.2rem', minWidth: '320px', border: '1px solid #cbd5e1' }}>
                    <svg width="18" height="18" fill="none" stroke="#64748b" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input 
                        type="text" 
                        placeholder="Search by name or mobile..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', marginLeft: '12px', width: '100%', color: '#0f172a', fontSize: '0.95rem' }} 
                    />
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '0.35rem', borderRadius: '10px' }}>
                    <button onClick={() => setActiveTab('all')} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s', backgroundColor: activeTab === 'all' ? '#ffffff' : 'transparent', color: activeTab === 'all' ? '#0f172a' : '#64748b', boxShadow: activeTab === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>All Patients</button>
                    <button onClick={() => setActiveTab('frequent')} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s', backgroundColor: activeTab === 'frequent' ? '#ffffff' : 'transparent', color: activeTab === 'frequent' ? '#0f172a' : '#64748b', boxShadow: activeTab === 'frequent' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>Frequent (2+ Visits)</button>
                    <button onClick={() => setActiveTab('recent')} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s', backgroundColor: activeTab === 'recent' ? '#ffffff' : 'transparent', color: activeTab === 'recent' ? '#0f172a' : '#64748b', boxShadow: activeTab === 'recent' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>Recent (30 Days)</button>
                </div>

                {/* Export Button & Dynamic Counter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
                        Showing: <span style={{ color: '#0f172a', fontWeight: 700 }}>{filteredPatients.length}</span>
                    </div>
                    <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.backgroundColor = '#059669'} onMouseLeave={e => e.target.style.backgroundColor = '#10b981'}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* STUNNING TABLE CONTAINER */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient Details</th>
                            <th style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Number</th>
                            <th style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Visit</th>
                            <th style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Visits</th>
                            <th style={{ padding: '1.25rem 1.5rem' }}></th> {/* Empty for chevron icon */}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Notice we map over filteredPatients now! */}
                        {filteredPatients.map((p, index) => {
                            const cleanName = formatName(p.PatientName);
                            const initials = getInitials(cleanName);
                            
                            return (
                                <tr 
                                    key={index} 
                                    onClick={() => handleRowClick(p)}
                                    style={{ 
                                        borderBottom: index !== filteredPatients.length - 1 ? '1px solid #f1f5f9' : 'none', 
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    {/* Patient Profile Col */}
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ backgroundColor: getAvatarColor(index), color: 'white', fontWeight: 'bold', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                                                {initials}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.05rem', marginBottom: '0.15rem' }}>{cleanName}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Recent ID: #{p.LatestVisitID}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Contact Col */}
                                    <td style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '500', fontSize: '0.95rem' }}>
                                        {p.Mobile || 'N/A'}
                                    </td>

                                    {/* Date Col */}
                                    <td style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: '500', fontSize: '0.95rem' }}>
                                        {formatDate(p.LastVisitDate)}
                                    </td>

                                    {/* Visits Pill Col */}
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{ 
                                            backgroundColor: p.VisitCount > 1 ? '#eff6ff' : '#f1f5f9', 
                                            color: p.VisitCount > 1 ? '#2563eb' : '#64748b',
                                            padding: '0.35rem 0.85rem', 
                                            borderRadius: '999px', 
                                            fontWeight: '600',
                                            fontSize: '0.85rem',
                                            display: 'inline-block'
                                        }}>
                                            {p.VisitCount} {p.VisitCount === 1 ? 'Visit' : 'Visits'}
                                        </span>
                                    </td>

                                    {/* Arrow Icon Col */}
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#cbd5e1' }}>
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 18l6-6-6-6"></path>
                                        </svg>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredPatients.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '1.1rem' }}>No patients match your filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- PATIENT HISTORY MODAL --- */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', padding: '2rem' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.4rem', margin: 0, color: '#0f172a' }}>Visit History: {selectedPatientName}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
                        </div>

                        {historyLoading ? (
                            <p style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b' }}>Loading history...</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                {patientHistory.map((visit) => (
                                    <div 
                                        key={visit.VisitID}
                                        onClick={() => navigate(`/old-patient?id=${visit.VisitID}`)}
                                        style={{
                                            padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            cursor: 'pointer', backgroundColor: '#f8fafc',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                                {formatDate(visit.VisitDate)}
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
                                                Visit ID: #{visit.VisitID}
                                            </div>
                                        </div>
                                        <div style={{ color: '#3b82f6', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            View Report
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
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