import React from 'react';
import { useNavigate } from 'react-router-dom';

const Help = () => {
    const navigate = useNavigate();

    return (
        <div className="login-page-wrapper">
            <div className="bg-shape shape-1"></div>
            <div className="bg-shape shape-2"></div>
            <div className="bg-shape shape-3"></div>
            
            <div className="login-container" style={{ padding: '3rem', flexDirection: 'column', maxWidth: '800px' }}>
                <h1 style={{ fontSize: '2.5rem', color: '#0f172a', marginBottom: '1rem', fontWeight: 800, textAlign: 'center' }}>Help & FAQs</h1>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>I forgot my password. How do I reset it?</h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Please contact the system administrator to securely reset your clinic credentials.</p>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>How do I search for an old patient?</h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Use the global search bar at the top of your dashboard. You can search by partial name or full mobile number.</p>
                    </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                    <button 
                        onClick={() => navigate('/')} 
                        style={{ padding: '0.8rem 2rem', backgroundColor: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '10px', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                        ← Return to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Help;