import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Note: If you moved your CSS to the public folder earlier, you can delete these two lines.
// If your CSS is still in the src folder, leave them exactly as they are!
import '../css/global.css';
import '../css/dashboard.css';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // States for Mobile Menu, Logout Modal, and Doctor's Name
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [doctorName, setDoctorName] = useState('Doctor'); // Default fallback

    // Fetch the doctor's name from localStorage when the layout loads
    useEffect(() => {
        const storedName = localStorage.getItem('doctorName');
        if (storedName) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDoctorName(storedName);
        }
    }, []);

    // This is the function that actually logs the user out when they click "Yes"
    const confirmLogout = () => {
        localStorage.removeItem('doctorToken');
        localStorage.removeItem('doctorName');
        localStorage.removeItem('dbName');
        navigate('/'); 
    };

    const handleNavClick = (path) => {
        setIsMobileMenuOpen(false);
        navigate(path);
    };

    return (
        <div className="dashboard-wrapper">
            
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* --- SIDEBAR --- */}
            <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="logo" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="6" cy="6" r="4" fill="#f59e0b"/>
                            <circle cx="18" cy="6" r="4" fill="#3b82f6"/>
                            <circle cx="6" cy="18" r="4" fill="#10b981"/>
                            <circle cx="18" cy="18" r="4" fill="#0ea5e9"/>
                        </svg>
                        Doctors
                    </div>
                    {/* Mobile Close Button */}
                    <button className="hamburger-toggle" onClick={() => setIsMobileMenuOpen(false)}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="profile-section">
                    <div className="doctor-avatar-container">
                        <svg width="120" height="120" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="50" fill="#e0f2fe"/>
                            <circle cx="50" cy="35" r="16" fill="#fca5a5"/>
                            <path d="M20 100 Q 20 60 50 60 Q 80 60 80 100 Z" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2"/>
                            <path d="M43 60 L 43 85 L 57 85 L 57 60" fill="#3b82f6"/>
                            <circle cx="50" cy="75" r="10" fill="none" stroke="#64748b" strokeWidth="2"/>
                        </svg>
                    </div>
                    {/* --- DYNAMIC DOCTOR NAME --- */}
                    <h2 className="welcome-text">Welcome back,<br/>{doctorName}.</h2>
                </div>

                <div className="quick-links-container">
                    <h3 className="quick-links-title">QUICK LINKS</h3>
                    
                    {/* --- ADDED: Home Link --- */}
                    <div className={`quick-link ${location.pathname === '/home' ? 'active-link' : ''}`} onClick={() => handleNavClick('/home')}>
                        <div className="icon-box outline-green">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                        </div>
                        <span style={{ fontWeight: 600 }}>Home</span>
                    </div>

                    {/* --- ADDED: Patients Link --- */}
                    <div className={`quick-link ${location.pathname === '/patients' ? 'active-link' : ''}`} onClick={() => handleNavClick('/patients')}>
                        <div className="icon-box outline-green">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                        <span style={{ fontWeight: 600 }}>Patients</span>
                    </div>

                    <div className={`quick-link ${location.pathname === '/new-patient' ? 'active-link' : ''}`} onClick={() => handleNavClick('/new-patient')}>
                        <div className="icon-box solid-green">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                        </div>
                        <span style={{ fontWeight: 600 }}>New Patient</span>
                    </div>
                    
                    <div className="quick-link">
                        <div className="icon-box outline-green">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <span style={{ fontWeight: 600 }}>View Reports</span>
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="main-content">
                
                {/* --- TOP NAVIGATION --- */}
                <header className="top-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
                    {/* Left Side: Hamburger Menu + New Profile Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="hamburger-toggle" onClick={() => setIsMobileMenuOpen(true)}>
                            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"></path></svg>
                        </button>

                        {/* --- THE NEW PROFILE DROPDOWN BUTTON --- */}
                        <div 
                            onClick={() => handleNavClick('/profile')}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.6rem', 
                                cursor: 'pointer', 
                                padding: '0.4rem 0.75rem', 
                                borderRadius: '10px', 
                                transition: 'background-color 0.2s ease',
                                border: '1px solid transparent'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                        >
                            <div style={{ width: '32px', height: '32px', backgroundColor: '#e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                <svg width="22" height="22" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="50" cy="35" r="16" fill="#fca5a5"/>
                                    <path d="M20 100 Q 20 60 50 60 Q 80 60 80 100 Z" fill="#3b82f6"/>
                                </svg>
                            </div>
                            <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.95rem' }}>{doctorName}</span>
                            <svg width="16" height="16" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                    </div>
                    
                    {/* Right Side: Links + Log Out */}
                    <div className="nav-right-group">
                        <nav className="nav-links">
                            <Link to="/home" className={location.pathname === '/home' ? 'active' : ''}>Home</Link>
                            <Link to="/patients" className={location.pathname === '/patients' ? 'active' : ''}>Patients</Link>
                            <a href="#">Reports</a>
                        </nav>
                        <button className="user-profile-btn" onClick={() => setIsLogoutModalOpen(true)}>Log Out</button>
                    </div>
                </header>

                {children}

                {/* --- LOGOUT CONFIRMATION MODAL --- */}
                {isLogoutModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsLogoutModalOpen(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', padding: '2.5rem' }}>
                            <div style={{ background: '#fee2e2', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: '#ef4444' }}>
                                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            </div>
                            <h2 style={{ marginBottom: '0.75rem', color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 800 }}>Log Out</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.05rem' }}>Are you sure you want to log out of your account?</p>
                            
                            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                                <button 
                                    className="btn-cancel" 
                                    style={{ flex: 1, padding: '0.85rem', fontSize: '1.05rem', whiteSpace: 'nowrap' }} 
                                    onClick={() => setIsLogoutModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn-save" 
                                    style={{ flex: 1, backgroundColor: '#ef4444', padding: '0.85rem', fontSize: '1.05rem', whiteSpace: 'nowrap' }} 
                                    onClick={confirmLogout}
                                >
                                    Yes, Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Layout;