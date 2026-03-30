import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/dashboard.css'; 
import '../css/profile.css';   

const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // Theme State
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('darkMode') === 'true'; 
    });

    // Modal States
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    // STRICTLY DYNAMIC STATE
    const [formData, setFormData] = useState({
        doctorName: '', designation: '', username: '',
        password: '', confirmPassword: '', clinicName: '',
        clinicAddress: '', clinicTimings: '', 
        phone: '', email: '' // Added to support the new UI fields
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // --- FETCH REAL DATA FROM DB ---
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('doctorToken');
                const response = await fetch('https://patient-record-app-drly.onrender.com/api/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                if (data.success) {
                    setFormData({
                        username: data.profile.Username || '',
                        password: '', confirmPassword: '',
                        doctorName: data.profile.DoctorName || '',
                        designation: data.profile.DoctorDesi || '',
                        clinicName: data.profile.CompName || '',
                        clinicAddress: data.profile.ClinicAddress || '',
                        clinicTimings: data.profile.ClinicTimings || '',
                        phone: data.profile.Mobile || '', 
                        email: data.profile.Email || '' 
                    });
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
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

    // --- SAVE TO DB LOGIC ---
    const handleSaveRequest = (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!"); 
            return;
        }
        setShowConfirmModal(true);
    };

    const executeSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('doctorToken');
            const response = await fetch('https://patient-record-app-drly.onrender.com/api/profile', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setShowConfirmModal(false);
                setShowSuccessModal(true); 
                if (formData.doctorName) localStorage.setItem('doctorName', formData.doctorName);
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                setTimeout(() => setShowSuccessModal(false), 3000);
            } else {
                setShowConfirmModal(false);
                alert(data.message || "Failed to save profile.");
            }
        } catch (error) {
            setShowConfirmModal(false);
            alert("Network error while saving.");
        } finally {
            setLoading(false);
        }
    };

    // --- PASSWORD STRENGTH LOGIC ---
    const getPasswordStrength = () => {
        const pass = formData.password;
        if (!pass) return { width: '0%', color: 'bg-slate-200', text: 'Enter a password to check strength', textColor: 'text-slate-500' };
        
        let score = 0;
        if (pass.length >= 8) score += 1;
        if (pass.length >= 12) score += 1;
        if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
        if (/\d/.test(pass)) score += 1;
        if (/[^a-zA-Z0-9]/.test(pass)) score += 1;

        if (score <= 2) return { width: '33%', color: '#ef4444', text: 'Weak - add more characters and symbols', textColor: '#ef4444' };
        if (score <= 3) return { width: '66%', color: '#f59e0b', text: 'Medium - consider adding special characters', textColor: '#f59e0b' };
        return { width: '100%', color: '#10b981', text: 'Strong password - excellent!', textColor: '#10b981' };
    };
    const strength = getPasswordStrength();

    // Dynamically extract initials from DB name
    const getInitials = (name) => {
        if (!name) return "DR";
        const parts = name.replace('Dr. ', '').trim().split(" ");
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
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
                            {/* Dynamically display Name from DB */}
                            <p className="doctor-name">{formData.doctorName || 'Loading...'}</p>
                            <p className="doctor-title">Cardiologist</p>
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
                    <button className="nav-item active">
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

            {/* MAIN PROFILE CONTENT */}
            <main className="main-content profile-main">
                <div className="profile-container-inner">
                    
                    {/* HERO BANNER - 100% Dynamic Data */}
                    <div className="profile-hero">
                        <div className="hero-bg-shapes"></div>
                        <div className="hero-content">
                            <div className="hero-avatar-wrapper">
                                <div className="hero-avatar">{getInitials(formData.doctorName)}</div>
                                <button className="hero-camera-btn"><span className="material-symbols-outlined">photo_camera</span></button>
                                <div className="status-dot"></div>
                            </div>
                            
                            <div className="hero-text">
                                <div className="badge-tag"><span className="dot"></span> Active Account</div>
                                <h1>{formData.doctorName || 'Loading Profile...'}</h1>
                                <p>{formData.designation || 'Designation not set'}</p>
                                
                                <div className="hero-meta">
                                    <span><span className="material-symbols-outlined">location_on</span> {formData.clinicName || 'Clinic not set'}</span>
                                    <span><span className="material-symbols-outlined">schedule</span> {formData.clinicTimings || 'Timings not set'}</span>
                                    <span><span className="material-symbols-outlined">verified</span> Verified</span>
                                </div>
                            </div>

                            <div className="hero-actions">
                                <button title="View"><span className="material-symbols-outlined">visibility</span></button>
                                <button title="Share"><span className="material-symbols-outlined">share</span></button>
                                <button title="Download"><span className="material-symbols-outlined">download</span></button>
                            </div>
                        </div>
                    </div>

                    <div className="profile-tabs glass-panel">
                        <button className="tab active"><span className="material-symbols-outlined">person</span> Profile</button>
                        <button className="tab"><span className="material-symbols-outlined">security</span> Security</button>
                        <button className="tab"><span className="material-symbols-outlined">notifications</span> Notifications</button>
                        <button className="tab"><span className="material-symbols-outlined">tune</span> Preferences</button>
                    </div>

                    {/* DYNAMIC SETTINGS FORM */}
                    <form onSubmit={handleSaveRequest} className="settings-forms">
                        
                        <div className="settings-card glass-panel">
                            <div className="settings-header header-green">
                                <div className="header-icon"><span className="material-symbols-outlined">lock</span></div>
                                <div className="header-text">
                                    <h2>Account Credentials</h2>
                                    <p>Secure your account with strong credentials.</p>
                                </div>
                                <div className="secure-badge"><span className="dot"></span> Secure</div>
                            </div>
                            
                            <div className="settings-body two-col">
                                <div className="body-left">
                                    <div className="info-box box-green">
                                        <h4><span className="material-symbols-outlined">tips_and_updates</span> Security Tips</h4>
                                        <ul>
                                            <li><span className="material-symbols-outlined">check_circle</span> Use at least 12 characters</li>
                                            <li><span className="material-symbols-outlined">check_circle</span> Mix uppercase & lowercase</li>
                                            <li><span className="material-symbols-outlined">check_circle</span> Include numbers & symbols</li>
                                        </ul>
                                    </div>
                                    <div className="info-box box-yellow mt-4">
                                        <h4><span className="material-symbols-outlined">info</span> Password Reset</h4>
                                        <p>Leave fields blank if you do not want to change your password.</p>
                                    </div>
                                </div>

                                <div className="body-right form-fields">
                                    <div className="form-group">
                                        <label><span className="material-symbols-outlined">badge</span> Username (Login ID)</label>
                                        <input type="text" id="username" value={formData.username} onChange={handleChange} className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label><span className="material-symbols-outlined">key</span> New Password</label>
                                        <div className="input-with-action">
                                            <input type={showPassword ? "text" : "password"} id="password" value={formData.password} onChange={handleChange} placeholder="Enter new password" className="form-input" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="icon-btn">
                                                <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                            </button>
                                        </div>
                                        {formData.password && (
                                            <div className="strength-meter">
                                                <div className="strength-track"><div className="strength-fill" style={{ width: strength.width, backgroundColor: strength.color }}></div></div>
                                                <p style={{ color: strength.textColor, fontSize: '0.75rem', marginTop: '0.25rem' }}>{strength.text}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label><span className="material-symbols-outlined">verified_user</span> Confirm Password</label>
                                        <div className="input-with-action">
                                            <input type={showConfirm ? "text" : "password"} id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm new password" className="form-input" />
                                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="icon-btn">
                                                <span className="material-symbols-outlined">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                                            </button>
                                        </div>
                                        {formData.confirmPassword && (
                                            <p style={{ color: formData.password === formData.confirmPassword ? '#10b981' : '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                                {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="settings-card glass-panel">
                            <div className="settings-header header-blue">
                                <div className="header-icon"><span className="material-symbols-outlined">person</span></div>
                                <div className="header-text">
                                    <h2>Personal Information</h2>
                                    <p>Details as they appear on prescriptions and records.</p>
                                </div>
                            </div>
                            
                            <div className="settings-body two-col">
                                <div className="body-left">
                                    <div className="preview-card glass-panel">
                                        <h4><span className="material-symbols-outlined">preview</span> Prescription Preview</h4>
                                        <div className="preview-content">
                                            <div className="preview-avatar">{getInitials(formData.doctorName)}</div>
                                            {/* DYNAMIC PREVIEW DATA */}
                                            <h3>{formData.doctorName || 'Doctor Name'}</h3>
                                            <p className="preview-des">{formData.designation || 'Designation'}</p>
                                            <div className="preview-meta mt-4">
                                                <span><span className="material-symbols-outlined">local_hospital</span> {formData.clinicName || 'Clinic Name'}</span>
                                                <span><span className="material-symbols-outlined">location_on</span> {formData.clinicAddress ? formData.clinicAddress.substring(0, 20) + '...' : 'Address'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="body-right form-fields">
                                    <div className="form-group">
                                        <label><span className="material-symbols-outlined">medical_information</span> Doctor's Full Name</label>
                                        <input type="text" id="doctorName" value={formData.doctorName} onChange={handleChange} placeholder="e.g., Dr. S.S. Gupta" className="form-input" required />
                                    </div>
                                    <div className="form-group">
                                        <label><span className="material-symbols-outlined">school</span> Designation & Qualifications</label>
                                        <input type="text" id="designation" value={formData.designation} onChange={handleChange} placeholder="e.g., M.D. (Homeo) Psychiatrist" className="form-input" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="settings-card glass-panel">
                            <div className="settings-header header-purple">
                                <div className="header-icon"><span className="material-symbols-outlined">local_hospital</span></div>
                                <div className="header-text">
                                    <h2>Clinic Details</h2>
                                    <p>Information for prescriptions and documentation.</p>
                                </div>
                            </div>
                            
                            <div className="settings-body form-fields">
                                <div className="form-group">
                                    <label><span className="material-symbols-outlined">business</span> Clinic Name</label>
                                    <input type="text" id="clinicName" value={formData.clinicName} onChange={handleChange} placeholder="e.g., City Health Clinic" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label><span className="material-symbols-outlined">location_on</span> Clinic Address</label>
                                    <textarea id="clinicAddress" rows="2" value={formData.clinicAddress} onChange={handleChange} placeholder="Full address" className="form-input resize-none"></textarea>
                                </div>
                                <div className="form-group">
                                    <label><span className="material-symbols-outlined">schedule</span> Clinic Timings</label>
                                    <input type="text" id="clinicTimings" value={formData.clinicTimings} onChange={handleChange} placeholder="e.g., Mon-Sat: 10AM - 6PM" className="form-input" />
                                </div>
                                
                                {/* New Dynamic Phone and Email Fields */}
                                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label><span className="material-symbols-outlined">call</span> Phone</label>
                                        <input type="text" id="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="form-input" />
                                    </div>
                                    <div>
                                        <label><span className="material-symbols-outlined">mail</span> Email</label>
                                        <input type="email" id="email" value={formData.email} onChange={handleChange} placeholder="doctor@clinic.com" className="form-input" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-actions-footer glass-panel">
                            <div className="last-saved"><span className="material-symbols-outlined">info</span> Data loaded from secure database.</div>
                            <div className="action-btns">
                                <button type="button" onClick={() => navigate('/home')} className="btn-cancel"><span className="material-symbols-outlined">close</span> Cancel</button>
                                <button type="submit" disabled={loading} className="btn-save"><span className="material-symbols-outlined">save</span> {loading ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        </div>

                    </form>
                </div>
            </main>

            {/* --- MODALS --- */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-content text-center">
                        <div className="modal-icon-blue"><span className="material-symbols-outlined">help</span></div>
                        <h3 className="modal-title">Confirm Changes</h3>
                        <p className="modal-desc">Are you sure you want to save these updates to your profile and clinic settings?</p>
                        <div className="modal-actions-row">
                            <button onClick={() => setShowConfirmModal(false)} className="btn-modal-cancel">Cancel</button>
                            <button onClick={executeSave} className="btn-modal-confirm">Yes, Save</button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="modal-content text-center">
                        <div className="modal-icon-green"><span className="material-symbols-outlined">check_circle</span></div>
                        <h3 className="modal-title">Success!</h3>
                        <p className="modal-desc">Your profile changes have been saved to the database successfully.</p>
                        <button onClick={() => setShowSuccessModal(false)} className="btn-modal-full">Awesome</button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Profile;