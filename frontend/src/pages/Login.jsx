import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [doctorId, setDoctorId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('doctorToken')) {
            navigate('/home');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

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
                alert(data.message);
                setLoading(false);
            }
        } catch (error) {
            console.error("Login request failed:", error);
            alert("Failed to connect to the server. Please ensure the backend is running.");
            setLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            
            {/* Animated Background Glowing Orbs */}
            <div className="bg-shape shape-1"></div>
            <div className="bg-shape shape-2"></div>
            <div className="bg-shape shape-3"></div>
            
            <div className="login-container">
                
                {/* --- LEFT SIDE: Branding & Illustration --- */}
                <div className="login-illustration">
                    <div className="logo">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <circle cx="6" cy="6" r="4" fill="#f59e0b"/>
                            <circle cx="18" cy="6" r="4" fill="#3b82f6"/>
                            <circle cx="6" cy="18" r="4" fill="#10b981"/>
                            <circle cx="18" cy="18" r="4" fill="#0ea5e9"/>
                        </svg>
                        Doctors
                    </div>
                    
                    <div className="illustration-wrapper">
                        <svg className="illustration-img" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <path d="M 25 200 C 25 110, 70 110, 100 110 C 130 110, 175 110, 175 200 Z" fill="#cbd5e1" />
                            <polygon points="82,110 118,110 100,160" fill="#ffffff" />
                            <path d="M 100 200 L 65 110 L 100 165 L 135 110 Z" fill="#94a3b8" opacity="0.3" />
                            <polygon points="95,140 105,140 100,195" fill="#ef4444" />
                            <polygon points="94,130 106,130 102,145 98,145" fill="#dc2626" />
                            <rect x="90" y="80" width="20" height="35" fill="#fcd34d" rx="4" />
                            <path d="M 68 65 C 68 30, 80 25, 100 25 C 120 25, 132 30, 132 65 C 132 90, 115 105, 100 105 C 85 105, 68 90, 68 65 Z" fill="#fcd34d" />
                            <path d="M 65 55 C 65 10, 135 10, 135 55 C 135 40, 100 25, 65 40 Z" fill="#334155" />
                            <path d="M 65 45 Q 60 70 70 75" fill="#334155" />
                            <path d="M 135 45 Q 140 70 130 75" fill="#334155" />
                            <path d="M 55 120 C 25 165, 30 195, 65 195" fill="none" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
                            <circle cx="65" cy="195" r="10" fill="#f8fafc" stroke="#334155" strokeWidth="6" />
                            <path d="M 145 120 L 145 150 C 145 160, 130 170, 120 170 C 110 170, 100 180, 100 190" fill="none" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>

                {/* --- RIGHT SIDE: Form & Nav --- */}
                <div className="login-form-section">
                    
                    <div className="login-nav">
                        <span>About</span>
                        <span>Contact</span>
                        <span>Help</span>
                        <button className="nav-btn">Book Appointment</button>
                    </div>

                    <div className="login-header">
                        <h1>Doctor Login</h1>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="input-wrapper">
                            <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <input 
                                type="text" 
                                className="login-input" 
                                placeholder="Doctor ID" 
                                value={doctorId}
                                onChange={(e) => setDoctorId(e.target.value)}
                                required 
                            />
                        </div>
                        
                        <div className="input-wrapper">
                            <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            <input 
                                type="password" 
                                className="login-input" 
                                placeholder="Password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>

                        <button type="submit" className="login-btn-submit" disabled={loading}>
                            {loading && <span className="spinner"></span>}
                            {loading ? 'Loading...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="form-footer">
                        Don't have an account yet? <a>Contact Admin</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;