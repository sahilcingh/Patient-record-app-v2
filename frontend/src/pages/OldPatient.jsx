import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../css/dashboard.css'; // Main layout styles
import '../css/new-patient.css'; // Using the exact same sleek form styles!

const OldPatient = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const visitId = searchParams.get('id');
    const formRef = useRef(null);
    
    const [initialLoading, setInitialLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Theme & Doctor Profile
    const [isDark, setIsDark] = useState(() => localStorage.getItem('darkMode') === 'true');
    const [doctorProfile, setDoctorProfile] = useState({
        name: localStorage.getItem('doctorName') || 'Loading...',
        designation: 'Loading...'
    });

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

    // --- AUTHENTICATION & FETCH DOCTOR PROFILE ---
    const handleAuthError = (status) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem('doctorToken');
            localStorage.removeItem('doctorName');
            localStorage.removeItem('dbName');
            navigate('/');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('doctorToken');
        if (!token) { navigate('/'); return; }

        const fetchProfile = async () => {
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
            } catch (err) { console.error("Error fetching profile:", err); }
        };
        fetchProfile();
    }, [navigate]);

    // --- FETCH EXISTING VISIT DATA ---
    useEffect(() => {
        if (!visitId) { navigate('/home'); return; }

        const fetchVisit = async () => {
            const token = localStorage.getItem('doctorToken');
            try {
                const res = await fetch(`https://patient-record-app-drly.onrender.com/api/patients/visit/${visitId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (!res.ok) { handleAuthError(res.status); return; }

                const data = await res.json();
                
                if (data.success) {
                    const v = data.visit;
                    let formattedDate = "";
                    if (v.B_Date) {
                        const d = new Date(v.B_Date);
                        formattedDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
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

    // --- KEYBOARD NAVIGATION ---
    useEffect(() => {
        if (initialLoading || !formRef.current) return;
        const focusableElements = Array.from(formRef.current.querySelectorAll('input, select, textarea'));

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                const target = e.target;
                if (target.tagName.toLowerCase() === 'textarea') return; 
                
                e.preventDefault();
                let index = focusableElements.indexOf(target);
                let nextIndex = index + 1;
                if (focusableElements[nextIndex]) focusableElements[nextIndex].focus();
            }
        };

        focusableElements.forEach(el => el.addEventListener('keydown', handleKeyDown));
        return () => focusableElements.forEach(el => el.removeEventListener('keydown', handleKeyDown));
    }, [initialLoading]);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem('darkMode', newTheme);
    };

    const handleLogout = () => {
        localStorage.removeItem('doctorToken');
        navigate('/');
    };

    // --- API EXECUTION FUNCTIONS ---
    const executeUpdate = async () => {
        alert("PUT route needs to be added to backend to update existing records.");
        setModalConfig({ ...modalConfig, isOpen: false });
    };

    const executeSaveNew = async () => {
        setProcessing(true);
        setModalConfig({ ...modalConfig, isOpen: false });
        const token = localStorage.getItem('doctorToken');
        
        const payload = {
            date: formData.visitDate, patientName: formData.patientName,
            fatherName: formData.fatherName, sex: formData.gender,
            age: formData.age, mobile: formData.mobile, address: formData.address, 
            chiefComplaint: formData.chiefComplaint, medicine: formData.medicine, 
            tests: investigationText,
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
        setProcessing(true); 
        try {
            const token = localStorage.getItem('doctorToken'); 
            const response = await fetch(`https://patient-record-app-drly.onrender.com/api/patients/visit/${visitId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            if (data.success) {
                setModalConfig({ ...modalConfig, isOpen: false }); 
                navigate('/home'); 
            } else {
                console.error(data.message || "Failed to delete the record.");
            }
        } catch (error) { console.error("Error deleting record:", error); }
        setProcessing(false);
    };

    // --- BUTTON CLICK HANDLERS ---
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
                action: handleDeleteConfirm
            });
        }
    };

    // Formatter for Header
    const getFormattedHeaderDate = () => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
    };

    if (initialLoading) return <div className="dashboard-wrapper" data-theme={isDark ? 'dark' : 'light'}><div style={{ padding: '3rem', width: '100%', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Record...</div></div>;

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
                    <button className="nav-item" onClick={() => navigate('/patients')}>
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
            <main className="main-content form-main">
                <header className="page-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h1>Visit Details: #{visitId}</h1>
                        <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>EDIT MODE</span>
                    </div>
                    <div className="header-actions">
                        <button className="icon-btn-header"><span className="material-symbols-outlined">notifications</span></button>
                        <div className="header-divider"></div>
                        <span className="header-date">{getFormattedHeaderDate()}</span>
                    </div>
                </header>

                {/* FORM CONTAINER */}
                <section className="form-card-container glass-panel">
                    <form ref={formRef} className="patient-form custom-scrollbar">
                        
                        {/* PERSONAL INFORMATION */}
                        <div className="form-section">
                            <div className="section-title">
                                <span className="title-bar"></span>
                                <h3>Personal Information</h3>
                            </div>

                            <div className="form-grid grid-personal-top">
                                <div className="form-group col-span-2">
                                    <label>Patient's Name *</label>
                                    <input type="text" id="patientName" value={formData.patientName} onChange={handleChange} placeholder="Enter name" className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label>Date *</label>
                                    <input type="date" id="visitDate" value={formData.visitDate} onChange={handleChange} className="form-input bg-locked" required />
                                </div>
                                <div className="form-group">
                                    <label>Age *</label>
                                    <input type="number" id="age" value={formData.age} onChange={handleChange} placeholder="Years" className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label>Gender *</label>
                                    <div className="select-wrapper">
                                        <select id="gender" value={formData.gender} onChange={handleChange} className="form-input appearance-none" required>
                                            <option value="" disabled>Select</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-grid grid-personal-bottom">
                                <div className="form-group col-span-2">
                                    <label>Father's Name *</label>
                                    <input type="text" id="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Enter father's name" className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label>Contact Number *</label>
                                    <input type="tel" id="mobile" value={formData.mobile} onChange={handleChange} placeholder="10-digit number" className="form-input" required />
                                </div>
                                <div className="form-group col-span-2">
                                    <label>Email Address</label>
                                    <input type="email" id="email" value={formData.email} onChange={handleChange} placeholder="example@gmail.com" className="form-input" />
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label>Address</label>
                                <textarea id="address" value={formData.address} onChange={handleChange} placeholder="Enter full address..." rows="1" className="form-input resize-y"></textarea>
                            </div>
                        </div>

                        {/* CLINICAL DETAILS */}
                        <div className="form-section mt-4">
                            <div className="section-title space-between">
                                <div className="flex-title">
                                    <span className="title-bar"></span>
                                    <h3>Clinical Details</h3>
                                </div>
                                <button type="button" onClick={() => setIsInvModalOpen(true)} className="btn-pill-outline">
                                    <span className="material-symbols-outlined">edit_document</span> {investigationText ? 'Edit Investigation' : 'Add Investigation'}
                                </button>
                            </div>

                            <div className="form-grid grid-2">
                                <div className="form-group">
                                    <label>Chief Complaint *</label>
                                    <textarea id="chiefComplaint" value={formData.chiefComplaint} onChange={handleChange} placeholder="Enter chief complaint..." rows="2" className="form-input resize-y" required></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Medicine *</label>
                                    <textarea id="medicine" value={formData.medicine} onChange={handleChange} placeholder="Enter prescribed medicine..." rows="2" className="form-input resize-y" required></textarea>
                                </div>
                            </div>
                        </div>

                        {/* BILLING DETAILS */}
                        <div className="form-section mt-4">
                            <div className="section-title">
                                <span className="title-bar"></span>
                                <h3>Billing Details</h3>
                            </div>

                            <div className="form-grid grid-4">
                                <div className="form-group">
                                    <label>Total *</label>
                                    <input type="number" id="total" value={formData.total} onChange={handleChange} placeholder="0" min="0" className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label>Cartage *</label>
                                    <input type="number" id="cartage" value={formData.cartage} onChange={handleChange} placeholder="0" min="0" className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label>Conveyance *</label>
                                    <input type="number" id="conveyance" value={formData.conveyance} onChange={handleChange} placeholder="0" min="0" className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label className="text-primary-bold">Grand Total</label>
                                    <input type="text" value={grandTotal} className="form-input input-highlight" readOnly />
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* BOTTOM BAR ACTION AREA (UNIQUE TO OLD PATIENT) */}
                    <div className="form-bottom-bar" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button type="button" onClick={() => handleActionClick('delete')} disabled={processing} 
                                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'background 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>delete</span> Delete
                            </button>
                        </div>

                        <div className="action-btns" style={{ display: 'flex', gap: '0.75rem' }}>
                            <button type="button" onClick={() => navigate('/home')} disabled={processing} className="btn-cancel">Cancel</button>
                            
                            <button type="button" onClick={() => handleActionClick('update')} disabled={processing} 
                                style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>update</span>
                                Update Record
                            </button>

                            <button type="button" onClick={() => handleActionClick('saveNew')} disabled={processing} className="btn-save shadow-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>content_copy</span>
                                Save as New
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* --- INVESTIGATION MODAL --- */}
            {isInvModalOpen && (
                <div className="modal-overlay" onClick={() => setIsInvModalOpen(false)}>
                    <div className="modal-content large" onClick={e => e.stopPropagation()}>
                        <div className="modal-header border-b">
                            <h2>Investigations / Tests</h2>
                            <button className="close-btn" onClick={() => setIsInvModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
                        </div>
                        
                        <div className="modal-body space-y">
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0 0 1rem 0' }}>
                                Review or edit the test details for this specific visit.
                            </p>
                            <textarea 
                                className="form-input resize-y" 
                                rows="6" 
                                placeholder="E.g., Complete Blood Count (CBC), X-Ray Chest..."
                                value={investigationText}
                                onChange={(e) => setInvestigationText(e.target.value)}
                                autoFocus
                            ></textarea>
                        </div>

                        <div className="modal-footer border-t">
                            <button type="button" className="btn-cancel" onClick={() => setIsInvModalOpen(false)}>Cancel</button>
                            <button type="button" className="btn-save shadow-btn" onClick={() => setIsInvModalOpen(false)}>
                                <span className="material-symbols-outlined">check</span> Confirm Edits
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- DYNAMIC ACTION MODAL --- */}
            {modalConfig.isOpen && (
                <div className="modal-overlay" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>
                    <div className="modal-content text-center padding-lg" onClick={e => e.stopPropagation()}>
                        <div style={{ background: `${modalConfig.color}20`, width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: modalConfig.color }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>
                                {modalConfig.type === 'delete' ? 'warning' : modalConfig.type === 'update' ? 'update' : 'content_copy'}
                            </span>
                        </div>
                        <h2 className="modal-title">{modalConfig.title}</h2>
                        <p className="modal-desc">{modalConfig.message}</p>
                        
                        <div className="modal-actions-row mt-4">
                            <button className="btn-modal-cancel" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>Cancel</button>
                            <button className="btn-modal-confirm" style={{ backgroundColor: modalConfig.color }} onClick={modalConfig.action}>
                                {processing ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OldPatient;