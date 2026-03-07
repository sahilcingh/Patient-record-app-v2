// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// const Login = () => {
//     const [doctorId, setDoctorId] = useState('');
//     const [password, setPassword] = useState('');
//     const [loading, setLoading] = useState(false);
    
//     // NEW: States for our custom Error Modal
//     const [showErrorModal, setShowErrorModal] = useState(false);
//     const [errorMessage, setErrorMessage] = useState('');
    
//     const navigate = useNavigate();

//     useEffect(() => {
//         if (localStorage.getItem('doctorToken')) {
//             navigate('/home');
//         }
//     }, [navigate]);

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         setLoading(true);

//         try {
//             const response = await fetch('https://patient-record-app-drly.onrender.com/api/login', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ doctorId, password })
//             });

//             const data = await response.json();

//             if (data.success) {
//                 localStorage.setItem('doctorToken', data.token);
//                 localStorage.setItem('doctorName', data.doctorName);
//                 localStorage.setItem('dbName', data.dbName);
//                 navigate('/home');
//             } else {
//                 // REMOVED alert(data.message);
//                 // Trigger our custom Error Modal instead!
//                 setErrorMessage(data.message || "Invalid credentials. Please try again.");
//                 setShowErrorModal(true);
//                 setLoading(false);
//             }
//         } catch (error) {
//             console.error("Login request failed:", error);
//             // Show modal for network errors too
//             setErrorMessage("Failed to connect to the server. Please ensure the backend is running.");
//             setShowErrorModal(true);
//             setLoading(false);
//         }
//     };

//     // Common overlay style for the modal
//     const overlayStyle = {
//         position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
//         backgroundColor: 'rgba(15, 23, 42, 0.4)',
//         backdropFilter: 'blur(4px)',
//         zIndex: 9999,
//         display: 'flex', alignItems: 'center', justifyContent: 'center'
//     };

//     return (
//         <div className="login-page-wrapper">
            
//             {/* Inline styles for modal animation */}
//             <style>
//                 {`
//                     @keyframes popIn {
//                         0% { opacity: 0; transform: scale(0.9) translateY(20px); }
//                         100% { opacity: 1; transform: scale(1) translateY(0); }
//                     }
//                 `}
//             </style>

//             {/* --- CUSTOM ERROR MODAL --- */}
//             {showErrorModal && (
//                 <div style={overlayStyle}>
//                     <div style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', textAlign: 'center', maxWidth: '400px', width: '90%', animation: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
//                         {/* Red Warning Icon */}
//                         <div style={{ width: '70px', height: '70px', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
//                             <svg width="36" height="36" fill="none" stroke="#ef4444" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                 <circle cx="12" cy="12" r="10"></circle>
//                                 <line x1="12" y1="8" x2="12" y2="12"></line>
//                                 <line x1="12" y1="16" x2="12.01" y2="16"></line>
//                             </svg>
//                         </div>
                        
//                         <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: 800 }}>Access Denied</h3>
//                         <p style={{ margin: '0 0 2rem 0', color: '#64748b', fontSize: '1rem', lineHeight: '1.5' }}>
//                             {errorMessage}
//                         </p>
                        
//                         <button
//                             onClick={() => setShowErrorModal(false)}
//                             style={{ 
//                                 padding: '0.85rem 2rem', 
//                                 backgroundColor: '#f1f5f9', 
//                                 color: '#0f172a', 
//                                 border: '1px solid #cbd5e1', 
//                                 borderRadius: '12px', 
//                                 fontWeight: 700, 
//                                 fontSize: '1.05rem', 
//                                 cursor: 'pointer', 
//                                 width: '100%',
//                                 transition: 'background-color 0.2s'
//                             }}
//                             onMouseEnter={e => e.target.style.backgroundColor = '#e2e8f0'}
//                             onMouseLeave={e => e.target.style.backgroundColor = '#f1f5f9'}
//                         >
//                             Try Again
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {/* Animated Background Glowing Orbs */}
//             <div className="bg-shape shape-1"></div>
//             <div className="bg-shape shape-2"></div>
//             <div className="bg-shape shape-3"></div>
            
//             <div className="login-container">
                
//                 {/* --- LEFT SIDE: Branding & Illustration --- */}
//                 <div className="login-illustration">
//                     <div className="logo">
//                         <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
//                             <circle cx="6" cy="6" r="4" fill="#f59e0b"/>
//                             <circle cx="18" cy="6" r="4" fill="#3b82f6"/>
//                             <circle cx="6" cy="18" r="4" fill="#10b981"/>
//                             <circle cx="18" cy="18" r="4" fill="#0ea5e9"/>
//                         </svg>
//                         Doctors
//                     </div>
                    
//                     <div className="illustration-wrapper">
//                         <svg className="illustration-img" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
//                             <path d="M 25 200 C 25 110, 70 110, 100 110 C 130 110, 175 110, 175 200 Z" fill="#cbd5e1" />
//                             <polygon points="82,110 118,110 100,160" fill="#ffffff" />
//                             <path d="M 100 200 L 65 110 L 100 165 L 135 110 Z" fill="#94a3b8" opacity="0.3" />
//                             <polygon points="95,140 105,140 100,195" fill="#ef4444" />
//                             <polygon points="94,130 106,130 102,145 98,145" fill="#dc2626" />
//                             <rect x="90" y="80" width="20" height="35" fill="#fcd34d" rx="4" />
//                             <path d="M 68 65 C 68 30, 80 25, 100 25 C 120 25, 132 30, 132 65 C 132 90, 115 105, 100 105 C 85 105, 68 90, 68 65 Z" fill="#fcd34d" />
//                             <path d="M 65 55 C 65 10, 135 10, 135 55 C 135 40, 100 25, 65 40 Z" fill="#334155" />
//                             <path d="M 65 45 Q 60 70 70 75" fill="#334155" />
//                             <path d="M 135 45 Q 140 70 130 75" fill="#334155" />
//                             <path d="M 55 120 C 25 165, 30 195, 65 195" fill="none" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
//                             <circle cx="65" cy="195" r="10" fill="#f8fafc" stroke="#334155" strokeWidth="6" />
//                             <path d="M 145 120 L 145 150 C 145 160, 130 170, 120 170 C 110 170, 100 180, 100 190" fill="none" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
//                         </svg>
//                     </div>
//                 </div>

//                 {/* --- RIGHT SIDE: Form & Nav --- */}
//                 <div className="login-form-section">
                    
//                     <div className="login-nav">
//                         <span onClick={() => navigate('/about')}>About</span>
//                         <span onClick={() => navigate('/contact')}>Contact</span>
//                         <span onClick={() => navigate('/help')}>Help</span>
//                         <button className="nav-btn">Book Appointment</button>
//                     </div>

//                     <div className="login-header">
//                         <h1>Doctor Login</h1>
//                     </div>

//                     <form onSubmit={handleLogin}>
//                         <div className="input-wrapper">
//                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
//                                 <circle cx="12" cy="7" r="4"></circle>
//                             </svg>
//                             <input 
//                                 type="text" 
//                                 className="login-input" 
//                                 placeholder="Doctor ID" 
//                                 value={doctorId}
//                                 onChange={(e) => setDoctorId(e.target.value)}
//                                 required 
//                             />
//                         </div>
                        
//                         <div className="input-wrapper">
//                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                 <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
//                                 <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
//                             </svg>
//                             <input 
//                                 type="password" 
//                                 className="login-input" 
//                                 placeholder="Password" 
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 required 
//                             />
//                         </div>

//                         <button type="submit" className="login-btn-submit" disabled={loading}>
//                             {loading && <span className="spinner"></span>}
//                             {loading ? 'Loading...' : 'Sign In'}
//                         </button>
//                     </form>

//                     <div className="form-footer">
//                         Don't have an account yet? <a onClick={() => navigate('/contact')}>Contact Admin</a>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Login;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    // --- AUTH STATES ---
    const [doctorId, setDoctorId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    // --- UI STATES ---
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    
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
                setErrorMessage(data.message || "Invalid credentials. Please try again.");
                setShowErrorModal(true);
                setLoading(false);
            }
        } catch (error) {
            console.error("Login request failed:", error);
            setErrorMessage("Failed to connect to the server. Please ensure the backend is running.");
            setShowErrorModal(true);
            setLoading(false);
        }
    };

    // Common overlay style for the error modal
    const overlayStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    };

    return (
        // The main wrapper dynamically applies the "dark" class based on state
        <div className={`h-screen w-screen flex items-center justify-center p-4 overflow-hidden transition-colors duration-500 ${isDarkMode ? 'dark bg-slate-900' : 'bg-gradient-to-br from-[#e0f2fe] to-[#dcfce7]'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
            
            <style>
                {`
                    @keyframes popIn {
                        0% { opacity: 0; transform: scale(0.9) translateY(20px); }
                        100% { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    .material-symbols-outlined {
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
                    }
                `}
            </style>

            {/* --- CUSTOM ERROR MODAL --- */}
            {showErrorModal && (
                <div style={overlayStyle}>
                    <div style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', textAlign: 'center', maxWidth: '400px', width: '90%', animation: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <div style={{ width: '70px', height: '70px', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                            <span className="material-symbols-outlined text-[#ef4444]" style={{ fontSize: '36px' }}>error</span>
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: 800 }}>Access Denied</h3>
                        <p style={{ margin: '0 0 2rem 0', color: '#64748b', fontSize: '1rem', lineHeight: '1.5' }}>{errorMessage}</p>
                        <button onClick={() => setShowErrorModal(false)} style={{ padding: '0.85rem 2rem', backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '12px', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', width: '100%', transition: 'background-color 0.2s' }}>
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* --- MAIN LOGIN CARD --- */}
            <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-[1.5rem] overflow-hidden flex flex-col md:flex-row h-auto max-h-[550px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.05)] border border-white/20 relative z-10 transition-colors duration-300">
                
                {/* LEFT SIDE: Branding & Illustration */}
                <div className="hidden md:flex md:w-5/12 bg-[#f0fdf4] dark:bg-emerald-950/30 p-6 flex-col items-center justify-center relative transition-colors duration-300">
                    <div className="absolute top-6 left-6 flex items-center space-x-2">
                        <div className="grid grid-cols-2 gap-0.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                            <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                        </div>
                        <span className="text-lg font-bold tracking-tight text-gray-800 dark:text-emerald-50">Healthcare</span>
                    </div>
                    
                    <div className="relative w-full max-w-[220px]">
                        <img alt="Friendly male doctor" className="w-full aspect-square rounded-2xl object-cover shadow-lg border-2 border-white dark:border-zinc-800" src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80"/>
                        <div className="absolute -bottom-3 -right-2 bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-md flex items-center space-x-2 border border-gray-100 dark:border-zinc-700 transition-colors duration-300">
                            <div className="bg-emerald-100 dark:bg-emerald-900/50 p-1 rounded-md">
                                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xs">verified</span>
                            </div>
                            <div>
                                <p className="text-[7px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">Identity</p>
                                <p className="text-[10px] font-bold text-gray-800 dark:text-gray-100 leading-none">Portal Active</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Form Section */}
                <div className="w-full md:w-7/12 p-8 md:px-10 md:py-8 flex flex-col bg-white dark:bg-zinc-900 transition-colors duration-300">
                    
                    {/* Top Nav */}
                    <div className="flex justify-end items-center space-x-4 mb-6 text-[12px] font-semibold">
                        <span onClick={() => navigate('/about')} className="text-gray-400 hover:text-[#10b981] cursor-pointer transition-colors">About</span>
                        <span onClick={() => navigate('/help')} className="text-gray-400 hover:text-[#10b981] cursor-pointer transition-colors">Help</span>
                        <span className="bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981] hover:text-white px-4 py-1.5 rounded-full cursor-pointer transition-all">Book Appt</span>
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-center">
                        <div className="max-w-sm mx-auto w-full">
                            <div className="mb-6 text-center md:text-left">
                                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight mb-1">Welcome Back</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Secure doctor authentication portal.</p>
                            </div>
                            
                            <form className="space-y-4" onSubmit={handleLogin}>
                                <div className="group">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Doctor ID</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10b981] transition-colors text-lg">badge</span>
                                        <input 
                                            type="text" 
                                            value={doctorId}
                                            onChange={(e) => setDoctorId(e.target.value)}
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600" 
                                            placeholder="ID Number" 
                                        />
                                    </div>
                                </div>
                                
                                <div className="group">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Password</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10b981] transition-colors text-lg">lock</span>
                                        <input 
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required 
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600" 
                                            placeholder="••••••••" 
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between py-1">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" className="rounded text-[#10b981] focus:ring-[#10b981] border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 h-3.5 w-3.5" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Keep active</span>
                                    </label>
                                    <span className="text-xs font-semibold text-[#10b981] hover:underline cursor-pointer">Forgot password?</span>
                                </div>
                                
                                <button type="submit" disabled={loading} className="w-full bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-3 rounded-lg shadow-md shadow-emerald-100 dark:shadow-none transition-all active:scale-[0.98] text-sm flex justify-center items-center">
                                    {loading ? (
                                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : 'Sign In'}
                                </button>
                            </form>
                            
                            <p className="mt-5 text-center text-xs text-gray-400 dark:text-gray-500">
                                System issues? <span onClick={() => navigate('/contact')} className="text-[#10b981] font-bold hover:underline cursor-pointer">Admin Support</span>
                            </p>
                        </div>
                    </div>
                    
                    {/* Footer / Dark Mode Toggle */}
                    <div className="mt-6 pt-4 border-t border-gray-50 dark:border-zinc-800 flex justify-between items-center">
                        <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-gray-400 hover:text-[#10b981] flex items-center space-x-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors">
                            <span className="material-symbols-outlined text-sm">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
                            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                        <span className="text-[10px] text-gray-300 dark:text-zinc-600 uppercase tracking-tighter font-semibold">v2.4.0 Secure Encryption</span>
                    </div>
                </div>
            </div>

            {/* Background Floating Orbs */}
            <div className="fixed top-0 right-0 -z-10 w-[300px] h-[300px] bg-blue-400/10 dark:bg-blue-900/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none transition-colors duration-500"></div>
            <div className="fixed bottom-0 left-0 -z-10 w-[300px] h-[300px] bg-emerald-400/10 dark:bg-emerald-900/10 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none transition-colors duration-500"></div>
        </div>
    );
};

export default Login;