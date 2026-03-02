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
            // Only 1 visit: Go straight to the old patient page
            navigate(`/old-patient?id=${patient.LatestVisitID}`);
        } else {
            // Multiple visits: Open the history modal
            setSelectedPatientName(patient.PatientName);
            setIsModalOpen(true);
            setHistoryLoading(true);
            
            const token = localStorage.getItem('doctorToken');
            try {
                // Fetch the history for this specific patient
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

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const d = new Date(dateString);
        return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
    };

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading Patients Directory...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 className="page-title" style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>Patient Directory</h1>

            <div className="form-card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Patient Name</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Contact Number</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Last Visit Date</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Visits</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map((p, index) => (
                            <tr 
                                key={index} 
                                onClick={() => handleRowClick(p)}
                                style={{ 
                                    borderBottom: '1px solid #e2e8f0', 
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-main)' }}>{p.PatientName}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{p.Mobile}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{formatDate(p.LastVisitDate)}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ 
                                        backgroundColor: p.VisitCount > 1 ? '#dbeafe' : '#f1f5f9', 
                                        color: p.VisitCount > 1 ? '#1d4ed8' : '#64748b',
                                        padding: '0.25rem 0.75rem', 
                                        borderRadius: '999px', 
                                        fontWeight: 600,
                                        fontSize: '0.85rem'
                                    }}>
                                        {p.VisitCount} {p.VisitCount === 1 ? 'Visit' : 'Visits'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {patients.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No patients found.</td>
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
                            <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Visit History: {selectedPatientName}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>

                        {historyLoading ? (
                            <p style={{ textAlign: 'center', padding: '2rem 0' }}>Loading history...</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                                {patientHistory.map((visit) => (
                                    <div 
                                        key={visit.VisitID}
                                        onClick={() => navigate(`/old-patient?id=${visit.VisitID}`)}
                                        style={{
                                            padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            cursor: 'pointer', backgroundColor: '#f8fafc'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Visit #{visit.VisitID}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Date: {formatDate(visit.VisitDate)}</div>
                                        </div>
                                        <div style={{ color: '#3b82f6', fontSize: '0.9rem', fontWeight: 600 }}>
                                            View Details →
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