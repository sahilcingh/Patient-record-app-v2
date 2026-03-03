import React from 'react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
    const navigate = useNavigate();

    return (
        <div className="login-page-wrapper">
            <div className="bg-shape shape-1"></div>
            <div className="bg-shape shape-2"></div>
            <div className="bg-shape shape-3"></div>
            
            <div className="login-container" style={{ padding: '3rem', flexDirection: 'column', maxWidth: '800px' }}>
                <h1 style={{ fontSize: '2.5rem', color: '#0f172a', marginBottom: '1rem', fontWeight: 800, textAlign: 'center' }}>Contact Administrator</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem', textAlign: 'center', marginBottom: '2.5rem' }}>
                    Need to set up a new clinic account or report a system issue? Reach out to our technical team below.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Email Support</h3>
                        <p style={{ margin: 0, color: '#10b981', fontWeight: 600 }}>admin@doctorportal.com</p>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Phone Support</h3>
                        <p style={{ margin: 0, color: '#10b981', fontWeight: 600 }}>+91 98765 43210</p>
                    </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                    <button 
                        onClick={() => navigate('/')} 
                        style={{ padding: '0.8rem 2rem', backgroundColor: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '10px', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.target.style.backgroundColor = '#cbd5e1'}
                        onMouseLeave={e => e.target.style.backgroundColor = '#e2e8f0'}
                    >
                        ← Return to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Contact;