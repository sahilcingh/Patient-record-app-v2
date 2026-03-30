import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [doctorId, setDoctorId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    // States for custom Error Modal
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
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

    const toggleDarkMode = () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', isDark);
    };

    // Common overlay style for the modal
    const overlayStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-sky-100 to-green-100 dark:from-sky-900 dark:to-emerald-900 font-['Inter']">
            
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
                            <svg width="36" height="36" fill="none" stroke="#ef4444" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: 800 }}>Access Denied</h3>
                        <p style={{ margin: '0 0 2rem 0', color: '#64748b', fontSize: '1rem', lineHeight: '1.5' }}>{errorMessage}</p>
                        <button
                            onClick={() => setShowErrorModal(false)}
                            style={{ padding: '0.85rem 2rem', backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '12px', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', width: '100%', transition: 'background-color 0.2s' }}
                            onMouseEnter={e => e.target.style.backgroundColor = '#e2e8f0'}
                            onMouseLeave={e => e.target.style.backgroundColor = '#f1f5f9'}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* --- MAIN LOGIN CARD --- */}
            <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-[1.5rem] overflow-hidden flex flex-col md:flex-row h-auto max-h-[480px] border border-white/20 relative z-10 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.05)]">
                
                {/* --- LEFT SIDE: Branding & Illustration --- */}
                <div className="hidden md:flex md:w-5/12 bg-[#f0fdf4] dark:bg-emerald-950/30 p-6 flex-col items-center justify-center relative">
                    <div className="absolute top-6 left-6 flex items-center space-x-2">
                        <div className="grid grid-cols-2 gap-0.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                            <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                        </div>
                        <span className="text-lg font-bold tracking-tight text-gray-800 dark:text-emerald-50">Healthcare</span>
                    </div>
                    
                    <div className="relative w-full max-w-[200px]">
                        <img alt="Friendly male doctor" className="w-full aspect-square rounded-2xl object-cover shadow-lg border-2 border-white dark:border-zinc-800" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQIwwzdEfZjGHKblsK-S4HPcRcy74Z0mTkxm_aS6Gt1jSiA1vRBb7UEHdwmASvWxydQQSPcbcxwmIvbDTdLa3ZUHvmnZiC-RBhiyoBYwLIX3Codq7J4RkOLSK7KeRKjEOJhKXZaVIzB-jmjcvGb9Yj16em7xQbSyhmdAq6fMjt-11jkT1uURLGsr2ma7DKVsHljawlKdaXz_dLMgJbbX-2hfc-fVmsY4U3pxzn-mFG0pWheXazFdEQIsw36oN7lga9cB4SURWRnjk" />
                        <div className="absolute -bottom-3 -right-2 bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-md flex items-center space-x-2 border border-gray-100 dark:border-zinc-700">
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

                {/* --- RIGHT SIDE: Form & Nav --- */}
                <div className="w-full md:w-7/12 p-6 md:px-8 md:py-6 flex flex-col bg-white dark:bg-zinc-900">
                    
                    <div className="flex justify-end items-center space-x-3 mb-4 text-[11px] font-semibold">
                        <span onClick={() => navigate('/about')} className="text-gray-400 hover:text-emerald-500 transition-colors cursor-pointer">About</span>
                        <span onClick={() => navigate('/help')} className="text-gray-400 hover:text-emerald-500 transition-colors cursor-pointer">Help</span>
                        <button className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white px-3 py-1 rounded-full transition-all">Book Appt</button>
                    </div>

                    <div className="flex-grow flex flex-col justify-center">
                        <div className="max-w-sm mx-auto w-full">
                            
                            <div className="mb-4 text-center md:text-left">
                                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">Welcome Back</h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Secure doctor authentication portal.</p>
                            </div>

                            <form className="space-y-3" onSubmit={handleLogin}>
                                <div className="group">
                                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1 ml-1">Doctor ID</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors text-lg">badge</span>
                                        <input 
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-300" 
                                            placeholder="ID Number" 
                                            type="text"
                                            value={doctorId}
                                            onChange={(e) => setDoctorId(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="group">
                                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1 ml-1">Password</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors text-lg">lock</span>
                                        <input 
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-300" 
                                            placeholder="••••••••" 
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between py-0.5">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input className="rounded text-emerald-500 focus:ring-emerald-500 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 h-3 w-3" type="checkbox" />
                                        <span className="text-[11px] text-gray-500 dark:text-gray-400">Keep active</span>
                                    </label>
                                    <a className="text-[11px] font-semibold text-emerald-500 hover:underline" href="#">Forgot password?</a>
                                </div>
                                
                                <button disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-lg shadow-md shadow-emerald-100 dark:shadow-none transition-all active:scale-[0.98] text-sm flex justify-center items-center" type="submit">
                                    {loading ? 'Logging in...' : 'Sign In'}
                                </button>
                            </form>
                            
                            <p className="mt-4 text-center text-[10px] text-gray-400 dark:text-gray-500">
                                System issues? <span onClick={() => navigate('/contact')} className="text-emerald-500 font-bold hover:underline cursor-pointer">Admin Support</span>
                            </p>
                        </div>
                    </div>

                    {/* --- FOOTER --- */}
                    <div className="mt-4 pt-3 border-t border-gray-50 dark:border-zinc-800 flex justify-between items-center">
                        <button onClick={toggleDarkMode} className="text-gray-400 hover:text-emerald-500 flex items-center space-x-1.5 text-[9px] font-medium uppercase tracking-wider transition-colors" type="button">
                            <span className="material-symbols-outlined text-sm">dark_mode</span>
                            <span>Mode</span>
                        </button>
                        <span className="text-[9px] text-gray-300 dark:text-zinc-600 uppercase tracking-tighter">v2.4.0 Secure Encryption</span>
                    </div>

                </div>
            </div>

            {/* Animated Background Glowing Orbs */}
            <div className="fixed top-0 right-0 -z-10 w-[300px] h-[300px] bg-blue-400/10 dark:bg-blue-900/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 -z-10 w-[300px] h-[300px] bg-emerald-400/10 dark:bg-emerald-900/10 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none"></div>
        </div>
    );
};

export default Login;