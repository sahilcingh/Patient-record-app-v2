import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/new-patient.css';

const NewPatient = () => {
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [loading, setLoading] = useState(false);
    
    // Modals State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isInvModalOpen, setIsInvModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        visitDate: '', patientName: '', age: '', gender: '',
        fatherName: '', mobile: '', email: '', address: '',
        chiefComplaint: '', medicine: '',
        total: '', cartage: '', conveyance: ''
    });
    
    // Investigation State
    const [investigationText, setInvestigationText] = useState('');

    const labelStyle = { 
        fontSize: '0.85rem', color: 'var(--text-muted)', 
        marginLeft: '5px', marginBottom: '4px', 
        display: 'block', fontWeight: 600 
    };

    // --- UPGRADED: Handle Input Changes with Strict Limits ---
    const handleChange = (e) => {
        const { id, value } = e.target;

        // 1. Mobile Number: Strictly numbers only, max 10 digits
        if (id === 'mobile') {
            const onlyNumbers = value.replace(/\D/g, ''); 
            if (onlyNumbers.length > 10) return; 
            setFormData(prev => ({ ...prev, [id]: onlyNumbers }));
            return;
        }

        // 2. Age Limit: Cannot exceed 105
        if (id === 'age') {
            if (value !== '' && parseInt(value) > 105) return; 
            setFormData(prev => ({ ...prev, [id]: value }));
            return;
        }

        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const grandTotal = (
        (parseFloat(formData.total) || 0) + 
        (parseFloat(formData.cartage) || 0) + 
        (parseFloat(formData.conveyance) || 0)
    ).toString();

    useEffect(() => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        setFormData(prev => ({ ...prev, visitDate: `${day}-${month}-${year}` }));

        if (!formRef.current) return;
        const focusableElements = Array.from(formRef.current.querySelectorAll('input, select, textarea, button[type="submit"]'));

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                const target = e.target;
                if (target.tagName.toLowerCase() === 'textarea') return; 
                
                e.preventDefault();
                let index = focusableElements.indexOf(target);
                let nextIndex = index + 1;

                if (focusableElements[nextIndex] && focusableElements[nextIndex].id === 'visitDate') {
                    nextIndex++;
                }
                if (focusableElements[nextIndex]) {
                    focusableElements[nextIndex].focus();
                }
            }
        };

        focusableElements.forEach(el => el.addEventListener('keydown', handleKeyDown));
        return () => focusableElements.forEach(el => el.removeEventListener('keydown', handleKeyDown));
    }, []);

    // --- AUTHENTICATION HELPER ---
    const handleAuthError = (status) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem('doctorToken');
            localStorage.removeItem('doctorName');
            localStorage.removeItem('dbName');
            navigate('/');
        }
    };

    // --- Intercept form submit to show popup first ---
    const handleInitialSubmit = (e) => {
        e.preventDefault();
        setShowConfirmModal(true); 
    };

    // --- REAL SUBMIT LOGIC (Triggered by the popup) ---
    const confirmSavePatient = async () => {
        setShowConfirmModal(false);
        setLoading(true);

        const token = localStorage.getItem('doctorToken');
        if (!token) {
            alert("Session expired. Please log in again.");
            navigate('/');
            return;
        }

        let sqlFormattedDate = formData.visitDate;
        if (sqlFormattedDate.includes('-')) {
            const [day, month, year] = sqlFormattedDate.split('-');
            if (year && year.length === 4) {
                sqlFormattedDate = `${year}-${month}-${day}`;
            }
        }

        const payload = {
            date: sqlFormattedDate, patientName: formData.patientName,
            fatherName: formData.fatherName, sex: formData.gender,
            age: formData.age, mobile: formData.mobile,
            address: formData.address, chiefComplaint: formData.chiefComplaint,
            medicine: formData.medicine, 
            tests: investigationText, // <-- Sent from our new modal
            total: formData.total || 0, cartage: formData.cartage || 0,
            conveyance: formData.conveyance || 0, grandTotal: grandTotal
        };

        try {
            const response = await fetch('https://patient-record-app-drly.onrender.com/api/visits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                handleAuthError(response.status);
                setLoading(false);
                return;
            }

            const data = await response.json();
            if (data.success) {
                navigate('/home'); 
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("Failed to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h1 className="page-title" style={{ marginBottom: '1rem', fontSize: '1.75rem' }}>New Patient Registration</h1>

            <div className="form-card">
                <form ref={formRef} onSubmit={handleInitialSubmit}>
                    
                    <div className="form-section-title">Personal Information</div>
                    
                    {/* TIGHTER MARGINS APPLIED BELOW */}
                    <div className="grid-personal-row1" style={{ marginBottom: '0.75rem' }}>
                        <div>
                            <label style={labelStyle}>Patient's Name *</label>
                            <input type="text" className="input-grey" id="patientName" value={formData.patientName} onChange={handleChange} placeholder="Enter name" required autoFocus />
                        </div>
                        <div>
                            <label style={labelStyle}>Date *</label>
                            <input type="text" className="input-grey" id="visitDate" value={formData.visitDate} onChange={handleChange} style={{ backgroundColor: '#f8fafc', fontWeight: 600 }} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Age *</label>
                            <input type="number" className="input-grey" id="age" value={formData.age} onChange={handleChange} placeholder="Years" required />
                        </div>
                        <div>
                            <label style={labelStyle}>Gender *</label>
                            <select className="input-grey" id="gender" value={formData.gender} onChange={handleChange} required>
                                <option value="" disabled>Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="grid-personal-row2" style={{ marginBottom: '0.75rem' }}>
                        <div>
                            <label style={labelStyle}>Father's Name *</label>
                            <input type="text" className="input-grey" id="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Enter father's name" required />
                        </div>
                        <div>
                            <label style={labelStyle}>Contact Number *</label>
                            <input type="text" className="input-grey" id="mobile" value={formData.mobile} onChange={handleChange} placeholder="10-digit number" required />
                        </div>
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <input type="email" className="input-grey" id="email" value={formData.email} onChange={handleChange} placeholder="example@mail.com" />
                        </div>
                    </div>

                    <div className="form-section-title">Address</div>
                    <div style={{ marginBottom: '0.75rem' }}>
                        <textarea className="input-grey" id="address" value={formData.address} onChange={handleChange} placeholder="Enter full address..." rows="1" style={{ resize: 'vertical' }} required></textarea>
                    </div>

                    {/* CLINICAL DETAILS & INVESTIGATION BUTTON */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', marginBottom: '0.5rem' }}>
                        <div className="form-section-title" style={{ margin: 0 }}>Clinical Details</div>
                        <button type="button" className="btn-green-light" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setIsInvModalOpen(true)}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
                            Add Investigation
                        </button>
                    </div>

                    <div className="grid-2" style={{ marginBottom: '0.75rem' }}>
                        <div>
                            <label style={labelStyle}>Chief Complaint *</label>
                            <textarea className="input-grey" id="chiefComplaint" value={formData.chiefComplaint} onChange={handleChange} placeholder="Enter chief complaint..." rows="2" style={{ resize: 'vertical' }} required></textarea>
                        </div>
                        <div>
                            <label style={labelStyle}>Medicine *</label>
                            <textarea className="input-grey" id="medicine" value={formData.medicine} onChange={handleChange} placeholder="Enter prescribed medicine..." rows="2" style={{ resize: 'vertical' }} required></textarea>
                        </div>
                    </div>

                    <div className="form-section-title">Billing Details</div>
                    <div className="grid-4-address" style={{ marginBottom: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Total *</label>
                            <input type="number" className="input-grey" id="total" value={formData.total} onChange={handleChange} placeholder="0" min="0" required />
                        </div>
                        <div>
                            <label style={labelStyle}>Cartage *</label>
                            <input type="number" className="input-grey" id="cartage" value={formData.cartage} onChange={handleChange} placeholder="0" min="0" required />
                        </div>
                        <div>
                            <label style={labelStyle}>Conveyance *</label>
                            <input type="number" className="input-grey" id="conveyance" value={formData.conveyance} onChange={handleChange} placeholder="0" min="0" required />
                        </div>
                        <div>
                            <label style={{ ...labelStyle, color: 'var(--primary)', fontWeight: 800 }}>Grand Total</label>
                            <input type="text" className="input-grey" value={grandTotal} readOnly style={{ backgroundColor: '#ecfdf5', fontWeight: 800, color: '#059669', borderColor: '#10b981' }} />
                        </div>
                    </div>

                    <div className="form-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn-save" disabled={loading} style={{ flex: 1 }}>
                            {loading ? 'Processing...' : 'Save Patient'}
                        </button>
                        <button type="button" className="btn-cancel" onClick={() => navigate('/home')} disabled={loading} style={{ flex: 1 }}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            {/* --- INVESTIGATION MODAL --- */}
            {isInvModalOpen && (
                <div className="modal-overlay" onClick={() => setIsInvModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', padding: '2rem' }}>
                        <div className="modal-header" style={{ marginBottom: '1.5rem', paddingBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-main)' }}>Investigations / Tests</h2>
                            <button className="close-btn" onClick={() => setIsInvModalOpen(false)}>×</button>
                        </div>
                        
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                            Enter the details of any tests or investigations prescribed for this patient.
                        </p>
                        
                        <textarea 
                            className="input-grey" 
                            rows="5" 
                            placeholder="E.g., Complete Blood Count (CBC), X-Ray Chest..."
                            value={investigationText}
                            onChange={(e) => setInvestigationText(e.target.value)}
                            style={{ resize: 'vertical', marginBottom: '1.5rem' }}
                            autoFocus
                        ></textarea>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="button" className="btn-cancel" style={{ flex: 1 }} onClick={() => setIsInvModalOpen(false)}>Cancel</button>
                            <button type="button" className="btn-save" style={{ flex: 1 }} onClick={() => setIsInvModalOpen(false)}>Save Tests</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SAVE CONFIRMATION MODAL --- */}
            {showConfirmModal && (
                <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', textAlign: 'center', padding: '3rem' }}>
                        <div style={{ background: '#dcfce7', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: '#10b981' }}>
                            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                        </div>
                        <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.5rem' }}>Confirm Patient Save</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: '1.5' }}>Are you sure you want to save <strong>{formData.patientName}</strong> to the database?</p>
                        
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn-cancel" style={{ flex: 1 }} onClick={() => setShowConfirmModal(false)}>Review Again</button>
                            <button className="btn-save" style={{ flex: 1 }} onClick={confirmSavePatient}>Yes, Save Record</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NewPatient;