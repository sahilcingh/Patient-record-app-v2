import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // NEW: State to control our custom success popup
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    // Profile State 
    const [formData, setFormData] = useState({
        doctorName: '',
        designation: '', 
        username: '',
        password: '',
        confirmPassword: '',
        clinicName: '',
        clinicAddress: '',
        clinicTimings: ''
    });

    // --- LOAD DATA ON MOUNT ---
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
                        password: '', 
                        confirmPassword: '',
                        doctorName: data.profile.DoctorName || '',
                        designation: data.profile.DoctorDesi || '',
                        clinicName: data.profile.CompName || '',
                        clinicAddress: data.profile.ClinicAddress || '',
                        clinicTimings: data.profile.ClinicTimings || ''
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

    // --- SAVE DATA TO DATABASE ---
    const handleSave = async (e) => {
        e.preventDefault();
        
        if (formData.password && formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!"); // Keeping error as simple alert for now
            return;
        }

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
                // REMOVED native alert()
                // Show our beautiful custom modal instead!
                setShowSuccessModal(true);
                
                if (formData.doctorName) localStorage.setItem('doctorName', formData.doctorName);
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                
                // Optional: Auto-close after 3 seconds
                setTimeout(() => {
                    setShowSuccessModal(false);
                }, 3000);

            } else {
                alert(data.message || "Failed to save profile.");
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("Network error while saving.");
        } finally {
            setLoading(false);
        }
    };

    // --- SHARED STYLES ---
    const labelStyle = { 
        fontSize: '0.8rem', color: '#64748b', 
        marginBottom: '0.5rem', 
        display: 'block', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em'
    };

    const inputStyle = {
        width: '100%', padding: '0.85rem 1.2rem', borderRadius: '10px', 
        border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', 
        fontSize: '0.95rem', color: '#0f172a', outline: 'none', transition: 'all 0.2s',
        boxSizing: 'border-box'
    };

    const cardStyle = {
        backgroundColor: '#ffffff', borderRadius: '16px', padding: '2.5rem', 
        marginBottom: '1.5rem', border: '1px solid #e2e8f0', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        display: 'flex', gap: '3rem', flexWrap: 'wrap'
    };

    const leftColStyle = {
        flex: '1', minWidth: '250px', maxWidth: '300px'
    };

    const rightColStyle = {
        flex: '2', minWidth: '300px'
    };

    return (
        <div style={{ padding: '2.5rem', maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
            
            {/* Inline styles for modal animation */}
            <style>
                {`
                    @keyframes popIn {
                        0% { opacity: 0; transform: scale(0.9) translateY(20px); }
                        100% { opacity: 1; transform: scale(1) translateY(0); }
                    }
                `}
            </style>

            {/* --- CUSTOM SUCCESS MODAL --- */}
            {showSuccessModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.4)', // Dark semi-transparent backdrop
                    backdropFilter: 'blur(4px)', // Nice blur effect
                    zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff', 
                        padding: '2.5rem', 
                        borderRadius: '20px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        textAlign: 'center', 
                        maxWidth: '400px', 
                        width: '90%',
                        animation: 'popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' // Smooth spring animation
                    }}>
                        {/* Green Checkmark Circle */}
                        <div style={{ 
                            width: '70px', height: '70px', 
                            backgroundColor: '#dcfce7', 
                            borderRadius: '50%', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            margin: '0 auto 1.5rem auto' 
                        }}>
                            <svg width="36" height="36" fill="none" stroke="#10b981" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5"></path>
                            </svg>
                        </div>
                        
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: 800 }}>Success!</h3>
                        <p style={{ margin: '0 0 2rem 0', color: '#64748b', fontSize: '1rem', lineHeight: '1.5' }}>
                            Your profile changes have been saved to the database successfully.
                        </p>
                        
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            style={{ 
                                padding: '0.85rem 2rem', 
                                backgroundColor: '#10b981', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '12px', 
                                fontWeight: 700, 
                                fontSize: '1.05rem', 
                                cursor: 'pointer', 
                                width: '100%',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={e => e.target.style.backgroundColor = '#059669'}
                            onMouseLeave={e => e.target.style.backgroundColor = '#10b981'}
                        >
                            Awesome
                        </button>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '2.5rem' }}>
                <h1 className="page-title" style={{ margin: 0, fontSize: '2rem', color: '#0f172a' }}>Settings & Profile</h1>
                <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.5rem' }}>Manage your account credentials and clinic information.</p>
            </div>

            <form onSubmit={handleSave}>
                
                {/* --- ACCOUNT CREDENTIALS CARD --- */}
                <div style={cardStyle}>
                    <div style={leftColStyle}>
                        <h2 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Account Credentials</h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                            Update your secure login details. Leave the password fields blank if you do not wish to change your current password.
                        </p>
                    </div>
                    
                    <div style={{ ...rightColStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}>Username (Login ID)</label>
                            <input type="text" id="username" value={formData.username} onChange={handleChange} placeholder="Enter your login username" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>New Password</label>
                            <input type="password" id="password" value={formData.password} onChange={handleChange} placeholder="Enter new password" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Confirm Password</label>
                            <input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm new password" style={inputStyle} />
                        </div>
                    </div>
                </div>

                {/* --- PERSONAL INFORMATION CARD --- */}
                <div style={cardStyle}>
                    <div style={leftColStyle}>
                        <h2 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Personal Information</h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                            Your name and professional designation as it will appear across the dashboard and on patient prescriptions.
                        </p>
                    </div>
                    
                    <div style={{ ...rightColStyle, display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Doctor's Full Name</label>
                            <input type="text" id="doctorName" value={formData.doctorName} onChange={handleChange} placeholder="e.g., S.S. Gupta" style={inputStyle} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Designation & Qualifications</label>
                            <input type="text" id="designation" value={formData.designation} onChange={handleChange} placeholder="e.g., M.D. (Homoeo) Psychiatrist" style={inputStyle} />
                        </div>
                    </div>
                </div>

                {/* --- CLINIC DETAILS CARD --- */}
                <div style={cardStyle}>
                    <div style={leftColStyle}>
                        <h2 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Clinic Details</h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                            This information is used to generate official patient visit records, prescriptions, and reports.
                        </p>
                    </div>
                    
                    <div style={{ ...rightColStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}>Clinic Name</label>
                            <input type="text" id="clinicName" value={formData.clinicName} onChange={handleChange} placeholder="e.g., City Health Clinic" style={inputStyle} />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}>Clinic Address</label>
                            <textarea id="clinicAddress" value={formData.clinicAddress} onChange={handleChange} placeholder="Enter full clinic address" rows="2" style={{ ...inputStyle, resize: 'vertical' }}></textarea>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}>Clinic Timings</label>
                            <input type="text" id="clinicTimings" value={formData.clinicTimings} onChange={handleChange} placeholder="e.g., Mon-Sat: 9 AM - 8 PM" style={inputStyle} />
                        </div>
                    </div>
                </div>

                {/* --- ACTIONS --- */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingBottom: '2rem' }}>
                    <button 
                        type="button" 
                        onClick={() => navigate('/home')} 
                        style={{ padding: '0.85rem 1.75rem', borderRadius: '10px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.95rem', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.target.style.backgroundColor = '#e2e8f0'}
                        onMouseLeave={e => e.target.style.backgroundColor = '#f1f5f9'}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading} 
                        style={{ padding: '0.85rem 2rem', borderRadius: '10px', backgroundColor: '#10b981', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.target.style.backgroundColor = '#059669'}
                        onMouseLeave={e => e.target.style.backgroundColor = '#10b981'}
                    >
                        {loading ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default Profile;