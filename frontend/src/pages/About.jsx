import React from 'react';
import { useNavigate } from 'react-router-dom';

const About = () => {
    const navigate = useNavigate();

    return (
        <div className="login-page-wrapper">
            <div className="bg-shape shape-1"></div>
            <div className="bg-shape shape-2"></div>
            <div className="bg-shape shape-3"></div>
            
            <div className="login-container" style={{ padding: '3rem', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '800px' }}>
                <h1 style={{ fontSize: '2.5rem', color: '#0f172a', marginBottom: '1rem', fontWeight: 800 }}>About Doctor Portal</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                    Welcome to the next generation of clinic management. Our portal is designed to streamline your daily workflow, allowing you to focus on what matters most: your patients. 
                    <br/><br/>
                    Built with security, speed, and simplicity in mind, this platform handles patient records, visit histories, and daily revenue tracking effortlessly.
                </p>
                
                <button 
                    onClick={() => navigate('/')} 
                    style={{ padding: '0.8rem 2rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.target.style.backgroundColor = '#059669'}
                    onMouseLeave={e => e.target.style.backgroundColor = '#10b981'}
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
};

export default About;