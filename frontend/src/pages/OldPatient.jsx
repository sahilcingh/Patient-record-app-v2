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

    // Form State
    const [formData, setFormData] = useState({
        visitDate: '', patientName: '', age: '', gender: '',
        fatherName: '', mobile: '', email: '', address: '',
        chiefComplaint: '', medicine: '',
        total: '0', cartage: '0', conveyance: '0'
    });

    const labelStyle = { fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '5px', marginBottom: '8px', display: 'block', fontWeight: 600 };

    // --- FETCH EXISTING DATA ---
    useEffect(() => {
        if (!visitId) {
            navigate('/home');
            return;
        }

        const fetchVisit = async () => {
            const token = localStorage.getItem('doctorToken');
            try {
                const res = await fetch(`http://localhost:5000/api/patients/visit/${visitId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
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
                        email: '', // Backend doesn't store email yet
                        address: v.B_To || '',
                        chiefComplaint: v.B_Perticu1 || '',
                        medicine: v.B_Perticu2 || '',
                        total: v.B_PerticuAmt1 || '0',
                        cartage: v.B_Cart || '0',
                        conveyance: v.B_Conv || '0'
                    });
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

    // --- BUTTON CLICK HANDLERS (Validates form before opening modal) ---
    const handleActionClick = (actionType) => {
        // Force HTML5 validation (checks for 'required' fields)
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
                action: executeDelete
            });
        }
    };

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
            tests: "", total: formData.total || 0, cartage: formData.cartage || 0,
            conveyance: formData.conveyance || 0, grandTotal: grandTotal
        };

        try {
            const response = await fetch('http://localhost:5000/api/visits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.success) navigate('/home');
            else alert(`Error: ${data.message}`);
        } catch (error) { console.error("Save error:", error); }
        setProcessing(false);
    };

    const executeDelete = async () => {
        alert("We need to add the DELETE route to server.js for this to work!");
        setModalConfig({ ...modalConfig, isOpen: false });
    };

    if (initialLoading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading Record...</div>;

    return (
        <>
            <h1 className="page-title">Visit Details: #{visitId}</h1>

            <div className="form-card">
                <form ref={formRef}>
                    <div className="form-section-title">Personal Information</div>
                    <div className="grid-personal-row1" style={{ marginBottom: '1.25rem' }}>
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
                    
                    <div className="grid-personal-row2" style={{ marginBottom: '1.5rem' }}>
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
                    <div style={{ marginBottom: '1.5rem' }}>
                        <textarea className="input-grey" id="address" value={formData.address} onChange={handleChange} rows="2" style={{ resize: 'vertical' }} required></textarea>
                    </div>

                    <div className="form-section-title">Clinical Details</div>
                    <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Chief Complaint *</label>
                            <textarea className="input-grey" id="chiefComplaint" value={formData.chiefComplaint} onChange={handleChange} rows="3" style={{ resize: 'vertical' }} required></textarea>
                        </div>
                        <div>
                            <label style={labelStyle}>Medicine *</label>
                            <textarea className="input-grey" id="medicine" value={formData.medicine} onChange={handleChange} rows="3" style={{ resize: 'vertical' }} required></textarea>
                        </div>
                    </div>

                    <div className="form-section-title">Billing Details</div>
                    <div className="grid-4-address" style={{ marginBottom: '1.5rem' }}>
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
                            <input type="text" className="input-grey" value={grandTotal} readOnly style={{ backgroundColor: '#dcfce7', fontWeight: 800, color: '#065f46', borderColor: '#10b981' }} />
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '3rem', flexWrap: 'wrap' }}>
                        <button type="button" className="btn-blue" onClick={() => handleActionClick('update')} disabled={processing}>Update Record</button>
                        <button type="button" className="btn-green-light" onClick={() => handleActionClick('saveNew')} disabled={processing}>Save as New Record</button>
                        <button type="button" className="btn-grey" onClick={() => navigate('/home')} disabled={processing}>Cancel</button>
                        <button type="button" className="btn-red" onClick={() => handleActionClick('delete')} disabled={processing} style={{ marginLeft: 'auto' }}>Delete</button>
                    </div>
                </form>
            </div>

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
                            <button className="btn-save" style={{ flex: 1, backgroundColor: modalConfig.color, padding: '0.85rem' }} onClick={modalConfig.action}>
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