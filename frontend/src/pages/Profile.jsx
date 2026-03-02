import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Profile State (Will map to Pat_User table later)
    const [formData, setFormData] = useState({
        doctorName: '',
        username: '',
        password: '',
        confirmPassword: '',
        clinicName: '',
        clinicAddress: '',
        clinicTimings: ''
    });

    // Mock fetch on load (Will connect to backend later)
    useEffect(() => {
        // Grab the name from local storage for now
        const storedName = localStorage.getItem('doctorName') || '';
        setFormData(prev => ({ ...prev, doctorName: storedName }));
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        if (formData.password && formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        setLoading(true);
        
        // TODO: We will write the PUT request to the backend here later!
        setTimeout(() => {
            alert("Profile frontend ready! We will connect this to the database next.");
            setLoading(false);
        }, 1000);
    };

    const labelStyle = { 
        fontSize: '0.85rem', color: '#64748b', 
        marginLeft: '5px', marginBottom: '6px', 
        display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em'
    };

    const inputStyle = {
        width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', 
        border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', 
        fontSize: '0.95rem', color: '#0f172a', outline: 'none', transition: 'border 0.2s'
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ margin: 0, fontSize: '2rem', color: '#1e293b' }}>Doctor Profile</h1>
                <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.5rem' }}>Manage your account settings and clinic information.</p>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <form onSubmit={handleSave} style={{ padding: '2.5rem' }}>
                    
                    {/* --- ACCOUNT SETTINGS --- */}
                    <h2 style={{ fontSize: '1.2rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>Account Credentials</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div>
                            <label style={labelStyle}>Username (Login ID)</label>
                            <input type="text" id="username" value={formData.username} onChange={handleChange} placeholder="Enter new username" style={inputStyle} />
                        </div>
                        <div></div> {/* Empty column for spacing */}
                        <div>
                            <label style={labelStyle}>New Password</label>
                            <input type="password" id="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Confirm New Password</label>
                            <input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm new password" style={inputStyle} />
                        </div>
                    </div>

                    {/* --- PERSONAL INFO --- */}
                    <h2 style={{ fontSize: '1.2rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>Personal Information</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div style={{ maxWidth: '50%' }}>
                            <label style={labelStyle}>Doctor's Full Name</label>
                            <input type="text" id="doctorName" value={formData.doctorName} onChange={handleChange} placeholder="e.g., Dr. S.S. Gupta" style={inputStyle} required />
                        </div>
                    </div>

                    {/* --- CLINIC DETAILS --- */}
                    <h2 style={{ fontSize: '1.2rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>Clinic Details (For Reports)</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div>
                            <label style={labelStyle}>Clinic Name</label>
                            <input type="text" id="clinicName" value={formData.clinicName} onChange={handleChange} placeholder="e.g., City Health Clinic" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Clinic Timings</label>
                            <input type="text" id="clinicTimings" value={formData.clinicTimings} onChange={handleChange} placeholder="e.g., Mon-Sat: 9 AM - 8 PM" style={inputStyle} />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}>Clinic Address</label>
                            <textarea id="clinicAddress" value={formData.clinicAddress} onChange={handleChange} placeholder="Enter full clinic address" rows="2" style={{ ...inputStyle, resize: 'vertical' }}></textarea>
                        </div>
                    </div>

                    {/* --- ACTIONS --- */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <button type="button" onClick={() => navigate('/home')} style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} style={{ padding: '0.8rem 2rem', borderRadius: '10px', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}>
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default Profile;