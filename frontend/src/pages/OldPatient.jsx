import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../css/new-patient.css';

const OldPatient = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const visitId = searchParams.get('id');
    const formRef = useRef(null);
    
    const [initialLoading, setInitialLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Dynamic Modal State (Handles Update, Save New, and Delete)
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', title: '', message: '', action: null, color: '' });
    
    // Investigation Modal State
    const [isInvModalOpen, setIsInvModalOpen] = useState(false);
    const [investigationText, setInvestigationText] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        visitDate: '', patientName: '', age: '', gender: '',
        fatherName: '', mobile: '', email: '', address: '',
        chiefComplaint: '', medicine: '',
        total: '0', cartage: '0', conveyance: '0'
    });

    const labelStyle = { 
        fontSize: '0.85rem', color: 'var(--text-muted)', 
        marginLeft: '5px', marginBottom: '4px', 
        display: 'block', fontWeight: 600 
    };

    // --- AUTHENTICATION HELPER ---
    const handleAuthError = (status) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem('doctorToken');
            localStorage.removeItem('doctorName');
            localStorage.removeItem('dbName');
            navigate('/');
        }
    };

    // --- FETCH EXISTING DATA ---
    useEffect(() => {
        if (!visitId) {
            navigate('/home');
            return;
        }

        const fetchVisit = async () => {
            const token = localStorage.getItem('doctorToken');
            try {
                const res = await fetch(`https://patient-record-app-drly.onrender.com/api/patients/visit/${visitId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (!res.ok) {
                    handleAuthError(res.status);
                    return;
                }

                const data = await res.json();
                
                if (data.success) {
                    const v = data.visit;
                    let formattedDate = "";
                    if (v.B_Date) {
                        const d = new Date(v.B_Date);
                        formattedDate = `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
                    }

                    setFormData({
                        visitDate: formattedDate,
                        patientName: v.B_PName || '',
                        age: v.B_Age || '',
                        gender: (v.B_Sex || '').toLowerCase(),
                        fatherName: v.B_FName || '',
                        mobile: v.B_Mobile || '',
                        email: '', 
                        address: v.B_To || '',
                        chiefComplaint: v.B_Perticu1 || '',
                        medicine: v.B_Perticu2 || '',
                        total: v.B_PerticuAmt1 || '0',
                        cartage: v.B_Cart || '0',
                        conveyance: v.B_Conv || '0'
                    });
                    
                    // Populate existing tests into the investigation state
                    setInvestigationText(v.B_Tests || '');
                    
                } else {
                    alert("Record not found.");
                    navigate('/home');
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchVisit();
    }, [visitId, navigate]);

    // --- ENTER KEY LOGIC (Runs after loading finishes) ---
    useEffect(() => {
        if (initialLoading || !formRef.current) return;
        const focusableElements = Array.from(formRef.current.querySelectorAll('input, select, textarea, button[type="button"]'));

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
    }, [initialLoading]);

    // --- STRICT INPUT HANDLING ---
    const handleChange = (e) => {
        const { id, value } = e.target;
        if (id === 'mobile') {
            const onlyNumbers = value.replace(/\D/g, ''); 
            if (onlyNumbers.length > 10) return; 
            setFormData(prev => ({ ...prev, [id]: onlyNumbers }));
            return;
        }
        if (id === 'age') {
            if (value !== '' && parseInt(value) > 105) return; 
            setFormData(prev => ({ ...prev, [id]: value }));
            return;
        }
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const grandTotal = ((parseFloat(formData.total) || 0) + (parseFloat(formData.cartage) || 0) + (parseFloat(formData.conveyance) || 0)).toString();

    // --- API EXECUTION FUNCTIONS ---
    const executeUpdate = async () => {
        alert("We need to add the PUT route to server.js for this to work!");
        setModalConfig({ ...modalConfig, isOpen: false });
    };

    const executeSaveNew = async () => {
        setProcessing(true);
        setModalConfig({ ...modalConfig, isOpen: false });
        const token = localStorage.getItem('doctorToken');
        
        // Format Date back to SQL
        let sqlFormattedDate = formData.visitDate;
        if (sqlFormattedDate.includes('-')) {
            const [day, month, year] = sqlFormattedDate.split('-');
            if (year && year.length === 4) sqlFormattedDate = `${year}-${month}-${day}`;
        }

        const payload = {
            date: sqlFormattedDate, patientName: formData.patientName,
            fatherName: formData.fatherName, sex: formData.gender,
            age: formData.age, mobile: formData.mobile, address: formData.address, 
            chiefComplaint: formData.chiefComplaint, medicine: formData.medicine, 
            tests: investigationText, // <-- Sent from modal
            total: formData.total || 0, cartage: formData.cartage || 0,
            conveyance: formData.conveyance || 0, grandTotal: grandTotal
        };

        try {
            const response = await fetch('https://patient-record-app-drly.onrender.com/api/visits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) { handleAuthError(response.status); return; }
            
            const data = await response.json();
            if (data.success) navigate('/home');
            else alert(`Error: ${data.message}`);
        } catch (error) { console.error("Save error:", error); }
        setProcessing(false);
    };

    const handleDeleteConfirm = async () => {
        setProcessing(true); // Disables buttons while deleting
        try {
            // FIXED: Using 'doctorToken' instead of 'token'
            const token = localStorage.getItem('doctorToken'); 

            // FIXED: Using 'visitId' instead of 'id'
            const response = await fetch(`https://patient-record-app-drly.onrender.com/api/patients/visit/${visitId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                alert("Visit record deleted successfully.");
                setModalConfig({ ...modalConfig, isOpen: false }); // Close the modal
                navigate('/home'); // Redirect to home/dashboard
            } else {
                alert(data.message || "Failed to delete the record.");
            }
        } catch (error) {
            console.error("Error deleting record:", error);
            alert("An error occurred while trying to delete.");
        }
        setProcessing(false);
    };

    // --- BUTTON CLICK HANDLERS (Validates form before opening modal) ---
    const handleActionClick = (actionType) => {
        if (actionType !== 'delete' && !formRef.current.reportValidity()) return;

        if (actionType === 'update') {
            setModalConfig({
                isOpen: true, type: 'update', title: 'Confirm Update', color: '#3b82f6',
                message: `Are you sure you want to update the existing record for ${formData.patientName}?`,
                action: executeUpdate
            });
        } else if (actionType === 'saveNew') {
            setModalConfig({
                isOpen: true, type: 'saveNew', title: 'Save as New Record', color: '#10b981',
                message: `This will create a completely new visit entry for ${formData.patientName}. Proceed?`,
                action: executeSaveNew
            });
        } else if (actionType === 'delete') {
            setModalConfig({
                isOpen: true, type: 'delete', title: 'Delete Record', color: '#ef4444',
                message: `WARNING: Are you sure you want to permanently delete Visit #${visitId}? This cannot be undone.`,
                action: handleDeleteConfirm // FIXED: Points to the correct function now
            });
        }
    };

    if (initialLoading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Record...</div>;

    return (
        <>
            <h1 className="page-title" style={{ marginBottom: '1rem', fontSize: '1.75rem' }}>Visit Details: #{visitId}</h1>

            <div className="form-card">
                <form ref={formRef}>
                    <div className="form-section-title">Personal Information</div>
                    
                    <div className="grid-personal-row1" style={{ marginBottom: '0.75rem' }}>
                        <div>
                            <label style={labelStyle}>Patient's Name *</label>
                            <input type="text" className="input-grey" id="patientName" value={formData.patientName} onChange={handleChange} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Date *</label>
                            <input type="text" className="input-grey" id="visitDate" value={formData.visitDate} onChange={handleChange} style={{ backgroundColor: '#f8fafc', fontWeight: 600 }} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Age *</label>
                            <input type="number" className="input-grey" id="age" value={formData.age} onChange={handleChange} required />
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
                            <input type="text" className="input-grey" id="fatherName" value={formData.fatherName} onChange={handleChange} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Contact Number *</label>
                            <input type="text" className="input-grey" id="mobile" value={formData.mobile} onChange={handleChange} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <input type="email" className="input-grey" id="email" value={formData.email} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-section-title">Address</div>
                    <div style={{ marginBottom: '0.75rem' }}>
                        <textarea className="input-grey" id="address" value={formData.address} onChange={handleChange} rows="1" style={{ resize: 'vertical' }} required></textarea>
                    </div>

                    {/* CLINICAL DETAILS & INVESTIGATION BUTTON */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', marginBottom: '0.5rem' }}>
                        <div className="form-section-title" style={{ margin: 0 }}>Clinical Details</div>
                        <button type="button" className="btn-green-light" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setIsInvModalOpen(true)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
                            {investigationText ? 'Edit Investigation' : 'Add Investigation'}
                        </button>
                    </div>

                    <div className="grid-2" style={{ marginBottom: '0.75rem' }}>
                        <div>
                            <label style={labelStyle}>Chief Complaint *</label>
                            <textarea className="input-grey" id="chiefComplaint" value={formData.chiefComplaint} onChange={handleChange} rows="2" style={{ resize: 'vertical' }} required></textarea>
                        </div>
                        <div>
                            <label style={labelStyle}>Medicine *</label>
                            <textarea className="input-grey" id="medicine" value={formData.medicine} onChange={handleChange} rows="2" style={{ resize: 'vertical' }} required></textarea>
                        </div>
                    </div>

                    <div className="form-section-title">Billing Details</div>
                    <div className="grid-4-address" style={{ marginBottom: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Total</label>
                            <input type="number" className="input-grey" id="total" value={formData.total} onChange={handleChange} min="0" required />
                        </div>
                        <div>
                            <label style={labelStyle}>Cartage</label>
                            <input type="number" className="input-grey" id="cartage" value={formData.cartage} onChange={handleChange} min="0" required />
                        </div>
                        <div>
                            <label style={labelStyle}>Conveyance</label>
                            <input type="number" className="input-grey" id="conveyance" value={formData.conveyance} onChange={handleChange} min="0" required />
                        </div>
                        <div>
                            <label style={{ ...labelStyle, color: 'var(--primary)', fontWeight: 800 }}>Grand Total</label>
                            <input type="text" className="input-grey" value={grandTotal} readOnly style={{ backgroundColor: '#ecfdf5', fontWeight: 800, color: '#059669', borderColor: '#10b981' }} />
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                        <button type="button" className="btn-blue" onClick={() => handleActionClick('update')} disabled={processing}>Update Record</button>
                        <button type="button" className="btn-green-light" onClick={() => handleActionClick('saveNew')} disabled={processing}>Save as New Record</button>
                        <button type="button" className="btn-grey" onClick={() => navigate('/home')} disabled={processing}>Cancel</button>
                        <button type="button" className="btn-red" onClick={() => handleActionClick('delete')} disabled={processing} style={{ marginLeft: 'auto' }}>Delete</button>
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

            {/* --- DYNAMIC ACTION MODAL --- */}
            {modalConfig.isOpen && (
                <div className="modal-overlay" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', textAlign: 'center', padding: '3rem' }}>
                        <div style={{ background: `${modalConfig.color}20`, width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: modalConfig.color }}>
                            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.5rem' }}>{modalConfig.title}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.05rem', lineHeight: '1.5' }}>{modalConfig.message}</p>
                        
                        <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                            <button className="btn-cancel" style={{ flex: 1, padding: '0.85rem' }} onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>Cancel</button>
                            <button className="btn-save" style={{ flex: 1, backgroundColor: modalConfig.color, padding: '0.85rem', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }} onClick={modalConfig.action}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OldPatient;