import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/dashboard.css'; 
import '../css/new-patient.css'; 

const NewPatient = () => {
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    const [isDark, setIsDark] = useState(() => localStorage.getItem('darkMode') === 'true');
    const [doctorProfile, setDoctorProfile] = useState({
        name: localStorage.getItem('doctorName') || 'Loading...',
        designation: 'Loading...'
    });

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isInvModalOpen, setIsInvModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        visitDate: '', patientName: '', age: '', gender: '',
        fatherName: '', mobile: '', email: '', address: '',
        chiefComplaint: '', medicine: '',
        total: '', cartage: '', conveyance: ''
    });
    
    const [investigationText, setInvestigationText] = useState('');

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
        setFormData(prev => ({ ...prev, visitDate: `${year}-${month}-${day}` }));

        if (!formRef.current) return;
        const focusableElements = Array.from(formRef.current.querySelectorAll('input, select, textarea, button[type="submit"]'));

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                const target = e.target;
                if (target.tagName.toLowerCase() === 'textarea') return; 
                
                e.preventDefault();
                let index = focusableElements.indexOf(target);
                let nextIndex = index + 1;

                if (focusableElements[nextIndex]) {
                    focusableElements[nextIndex].focus();
                }
            }
        };

        focusableElements.forEach(el => el.addEventListener('keydown', handleKeyDown));
        return () => focusableElements.forEach(el => el.removeEventListener('keydown', handleKeyDown));
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem('darkMode', newTheme);
    };

    const handleLogout = () => {
        localStorage.removeItem('doctorToken');
        navigate('/');
    };

    const handleInitialSubmit = (e) => {
        e.preventDefault();
        setShowConfirmModal(true); 
    };

    const confirmSavePatient = async () => {
        setShowConfirmModal(false);
        setLoading(true);

        const token = localStorage.getItem('doctorToken');
        if (!token) {
            alert("Session expired. Please log in again.");
            navigate('/');
            return;
        }

        const payload = {
            date: formData.visitDate, patientName: formData.patientName,
            fatherName: formData.fatherName, sex: formData.gender,
            age: formData.age, mobile: formData.mobile,
            address: formData.address, chiefComplaint: formData.chiefComplaint,
            medicine: formData.medicine, 
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
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('doctorToken');
                    navigate('/');
                }
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

    const getFormattedHeaderDate = () => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
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
                    <button className="nav-item" onClick={() => navigate('/patients')}>
                        <span className="material-symbols-outlined">group</span>
                        {isSidebarOpen && <span>Patients</span>}
                    </button>
                    <button className="nav-item active">
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
                    <h1>New Patient Registration</h1>
                    <div className="header-actions">
                        <button className="icon-btn-header"><span className="material-symbols-outlined">notifications</span></button>
                        <div className="header-divider"></div>
                        <span className="header-date">{getFormattedHeaderDate()}</span>
                    </div>
                </header>

                <section className="form-card-container glass-panel">
                    <form ref={formRef} onSubmit={handleInitialSubmit} className="patient-form custom-scrollbar">
                        
                        <div className="form-section">
                            <div className="section-title">
                                <span className="title-bar"></span>
                                <h3>Personal Information</h3>
                            </div>

                            <div className="form-grid grid-personal-top">
                                <div className="form-group col-span-2">
                                    <label>Patient's Name *</label>
                                    <input type="text" id="patientName" value={formData.patientName} onChange={handleChange} placeholder="Enter name" className="form-input" required autoFocus />
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

                        <div className="form-section mt-4">
                            <div className="section-title space-between">
                                <div className="flex-title">
                                    <span className="title-bar"></span>
                                    <h3>Clinical Details</h3>
                                </div>
                                <button type="button" onClick={() => setIsInvModalOpen(true)} className="btn-pill-outline">
                                    <span className="material-symbols-outlined">add_circle</span> Add Investigation
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

                    <div className="form-bottom-bar">
                        <div className="mandatory-text">
                            <span className="material-symbols-outlined">info</span> * mandatory fields
                        </div>
                        <div className="action-btns">
                            <button type="button" onClick={() => navigate('/home')} disabled={loading} className="btn-cancel">Cancel</button>
                            <button type="button" onClick={() => formRef.current.requestSubmit()} disabled={loading} className="btn-save shadow-btn">
                                <span className="material-symbols-outlined">person_add_alt</span>
                                {loading ? 'Processing...' : 'Save Patient'}
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* --- FIX: BULLETPROOF INVESTIGATION MODAL --- */}
            {isInvModalOpen && (
                <div className="modal-overlay" onClick={() => setIsInvModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', padding: '2rem', borderRadius: '16px' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                            <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800, color: 'var(--text-main)' }}>
                                Add New Investigation
                            </h2>
                            <button 
                                onClick={() => setIsInvModalOpen(false)} 
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', transition: 'background 0.2s', flexShrink: 0 }} 
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'} 
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>close</span>
                            </button>
                        </div>
                        
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                            Enter the details of any tests or investigations prescribed for this patient.
                        </p>
                        
                        <textarea 
                            className="form-input custom-scrollbar" 
                            rows="6" 
                            placeholder="E.g., Complete Blood Count (CBC), X-Ray Chest..."
                            value={investigationText}
                            onChange={(e) => setInvestigationText(e.target.value)}
                            autoFocus
                            style={{ width: '100%', resize: 'vertical', marginBottom: '1.5rem', padding: '1rem' }}
                        ></textarea>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                            <button type="button" className="btn-cancel" onClick={() => setIsInvModalOpen(false)}>Cancel</button>
                            <button type="button" className="btn-save shadow-btn" onClick={() => setIsInvModalOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="material-symbols-outlined">add</span> Add Investigation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SAVE CONFIRMATION MODAL --- */}
            {showConfirmModal && (
                <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
                    <div className="modal-content text-center padding-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-icon-green"><span className="material-symbols-outlined">how_to_reg</span></div>
                        <h2 className="modal-title">Confirm Patient Save</h2>
                        <p className="modal-desc">Are you sure you want to save <strong>{formData.patientName || 'this patient'}</strong> to the database?</p>
                        
                        <div className="modal-actions-row mt-4">
                            <button className="btn-modal-cancel" onClick={() => setShowConfirmModal(false)}>Review Again</button>
                            <button className="btn-modal-confirm" onClick={confirmSavePatient}>Yes, Save Record</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewPatient;