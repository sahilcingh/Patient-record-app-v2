import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    // --- YOUR EXACT STATE & LOGIC ---
    const [doctorId, setDoctorId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(''); // Added to replace alerts with modern UI errors
    const navigate = useNavigate();

    // Check if already logged in
    useEffect(() => {
        if (localStorage.getItem('doctorToken')) {
            navigate('/home');
        }
    }, [navigate]);

    // Your actual backend fetch request
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(''); // Clear old errors

        try {
            const response = await fetch('https://patient-record-app-drly.onrender.com/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorId, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('doctorToken', data.token);
                localStorage.setItem('doctorName', data.doctorName);
                localStorage.setItem('dbName', data.dbName);
                navigate('/home');
            } else {
                setError(data.message); // Shows error beautifully in UI
                setLoading(false);
            }
        } catch (err) {
            console.error("Login request failed:", err);
            setError("Failed to connect to the server. Please ensure the backend is running.");
            setLoading(false);
        }
    };

    // --- SHARED STYLES TO MATCH DASHBOARD THEME ---
    const inputStyle = {
        width: '100%', padding: '0.9rem 1.2rem', borderRadius: '10px', 
        border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', 
        fontSize: '1rem', color: '#0f172a', outline: 'none', transition: 'border 0.2s',
        boxSizing: 'border-box', marginBottom: '1.25rem'
    };

    const labelStyle = { 
        fontSize: '0.85rem', color: '#64748b', 
        marginBottom: '0.5rem', display: 'block', 
        fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em'
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            
            {/* --- LEFT SIDE: THEMATIC BRAND PANEL --- */}
            <div style={{ 
                flex: 1, 
                display: 'none', // Hidden on mobile, shown on larger screens
                '@media (min-width: 768px)': { display: 'flex' },
                background: 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '3rem',
                position: 'relative',
                overflow: 'hidden'
            }} className="desktop-only-panel">
                
                {/* Background decorative glowing orbs */}
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
                <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '250px', height: '250px', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', filter: 'blur(30px)' }}></div>

                <div style={{ zIndex: 1, color: 'white', maxWidth: '450px', width: '100%' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 1rem 0', lineHeight: 1.1 }}>
                        Modernize your clinic's workflow.
                    </h1>
                    <p style={{ fontSize: '1.15rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '3rem' }}>
                        Access patient records, track daily revenue, and manage appointments effortlessly from one intelligent dashboard.
                    </p>

                    {/* Floating Abstract Dashboard Card (Ties into your theme) */}
                    <div style={{ 
                        background: 'rgba(255, 255, 255, 0.15)', 
                        backdropFilter: 'blur(12px)', 
                        WebkitBackdropFilter: 'blur(12px)',
                        borderRadius: '16px', 
                        padding: '1.5rem', 
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9, fontWeight: 600 }}>Patients Today</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>Smart Tracking</div>
                            </div>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: '70%', height: '100%', background: 'white', borderRadius: '2px' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT SIDE: LOGIN FORM --- */}
            <div style={{ 
                flex: 1, display: 'flex', flexDirection: 'column', 
                justifyContent: 'center', alignItems: 'center', padding: '2rem',
                backgroundColor: '#ffffff'
            }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2.5rem', justifyContent: 'center' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="6" cy="6" r="4" fill="#f59e0b"/>
                            <circle cx="18" cy="6" r="4" fill="#3b82f6"/>
                            <circle cx="6" cy="18" r="4" fill="#10b981"/>
                            <circle cx="18" cy="18" r="4" fill="#0ea5e9"/>
                        </svg>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>Doctors</span>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Welcome back</h2>
                        <p style={{ color: '#64748b', margin: 0, fontSize: '1rem' }}>Please enter your credentials to access your dashboard.</p>
                    </div>

                    {/* Modern UI Error Message (Replaces Alerts) */}
                    {error && (
                        <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center', fontWeight: 500, border: '1px solid #fecaca' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="doctorId" style={labelStyle}>Doctor ID</label>
                            <input 
                                type="text" 
                                id="doctorId" 
                                name="doctorId"
                                value={doctorId}
                                onChange={(e) => setDoctorId(e.target.value)}
                                placeholder="Enter your Doctor ID" 
                                style={inputStyle} 
                                required 
                            />
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label htmlFor="password" style={labelStyle}>Password</label>
                            </div>
                            <input 
                                type="password" 
                                id="password" 
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••" 
                                style={inputStyle} 
                                required 
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ 
                                width: '100%', padding: '0.9rem', marginTop: '0.5rem',
                                backgroundColor: '#10b981', color: 'white', 
                                border: 'none', borderRadius: '10px', 
                                fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s, transform 0.1s',
                                boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.25)'
                            }}
                            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#059669')}
                            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#10b981')}
                            onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.98)')}
                            onMouseUp={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>
                    
                    <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#64748b' }}>
                        Don't have an account yet? <span style={{ color: '#10b981', fontWeight: 600, cursor: 'pointer' }}>Contact Admin</span>
                    </div>

                </div>
            </div>

            {/* A tiny bit of CSS to handle the desktop/mobile layout switch for the left panel */}
            <style dangerouslySetInnerHTML={{__html: `
                @media (max-width: 768px) {
                    .desktop-only-panel { display: none !important; }
                }
            `}} />
        </div>
    );
};

export default Login;