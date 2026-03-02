import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientsList = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ margin: 0, fontSize: '2rem', color: '#1e293b' }}>Patient Directory</h1>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>
                    Total Unique Patients: {patients.length}
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
                        {patients.map((p, index) => {
                            const cleanName = formatName(p.PatientName);
                            const initials = getInitials(cleanName);
                            
                            return (
                                <tr 
                                    key={index} 
                                    onClick={() => handleRowClick(p)}
                                    style={{ 
                                        borderBottom: index !== patients.length - 1 ? '1px solid #f1f5f9' : 'none', 
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
                        {patients.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '1.1rem' }}>No patients found in the database.</td>
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