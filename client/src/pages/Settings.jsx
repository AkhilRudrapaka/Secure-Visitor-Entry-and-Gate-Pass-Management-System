import { useState, useEffect, useContext } from 'react';
import { Shield, User, Mail, Save } from 'lucide-react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const Settings = () => {
    const { user, setUser } = useContext(AuthContext); 
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // 2FA State
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({ name: '' });

    // Password State
    const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    // Email State
    const [emailData, setEmailData] = useState({ newEmail: '', password: '', otp: '' });
    const [showEmailOtp, setShowEmailOtp] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({ name: user.name });
            setTwoFactorEnabled(user.twoFactorEnabled); 
        }
    }, [user]);

    // Helper to show message
    const showMsg = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    // 1. Update Profile
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put('/auth/updatedetails', { name: profileData.name });
            setUser({ ...user, name: data.data.name }); 
            showMsg('success', 'Profile updated successfully');
        } catch (err) {
            showMsg('error', err.response?.data?.message || 'Failed to update user details');
        }
        setLoading(false);
    };

    // 2. Update Password
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) {
            showMsg('error', 'New passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await api.put('/auth/updatepassword', { 
                currentPassword: passData.currentPassword, 
                newPassword: passData.newPassword 
            });
            setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            showMsg('success', 'Password updated successfully');
        } catch (err) {
            showMsg('error', err.response?.data?.message || 'Failed to update password');
        }
        setLoading(false);
    };

    // 3. Initiate Email Update
    const handleInitiateEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/update-email/initiate', {
                newEmail: emailData.newEmail,
                password: emailData.password
            });
            setShowEmailOtp(true);
            showMsg('success', `OTP sent to ${emailData.newEmail}`);
        } catch (err) {
            showMsg('error', err.response?.data?.message || 'Failed to send OTP');
        }
        setLoading(false);
    };

    // 4. Verify Email Update
    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put('/auth/update-email/verify', { otp: emailData.otp });
            setUser({ ...user, email: data.data.email });
            setEmailData({ newEmail: '', password: '', otp: '' });
            setShowEmailOtp(false);
            showMsg('success', 'Email updated successfully');
        } catch (err) {
            showMsg('error', err.response?.data?.message || 'Failed to verify OTP');
        }
        setLoading(false);
    };

    // 5. Toggle 2FA
    const handleToggle2FA = async () => {
        setLoading(true);
        try {
            const { data } = await api.put('/auth/toggle-2fa');
            setTwoFactorEnabled(data.twoFactorEnabled);
            showMsg('success', data.message);
        } catch (err) {
            showMsg('error', err.response?.data?.message || 'Failed to update 2FA');
        }
        setLoading(false);
    };

    return (
        <div className="container" style={{ padding: '100px 20px 50px', maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '2rem' }}>Account Settings</h1>

            {message.text && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    background: message.type === 'success' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                    color: message.type === 'success' ? '#4caf50' : '#f44336',
                    border: `1px solid ${message.type === 'success' ? '#4caf50' : '#f44336'}`,
                    textAlign: 'center'
                }}>
                    {message.text}
                </div>
            )}

            {/* Profile Section */}
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    <User size={20} /> Personal Information
                </h3>
                <form onSubmit={handleUpdateProfile}>
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <input 
                            type="text" 
                            className="input-field" 
                            value={profileData.name}
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <Save size={16} style={{ marginRight: '8px' }} /> Update Profile
                    </button>
                </form>
            </div>

            {/* Security Section (Password & 2FA) */}
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    <Shield size={20} /> Security
                </h3>

                {/* 2FA Toggle */}
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h4 style={{ margin: 0 }}>Two-Factor Authentication</h4>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Secure your account with email OTP.
                        </p>
                    </div>
                    <button 
                        onClick={handleToggle2FA}
                        className={`btn ${twoFactorEnabled ? 'btn-outline' : 'btn-primary'}`}
                        disabled={loading}
                        style={{ borderColor: twoFactorEnabled ? 'var(--danger)' : 'var(--primary)', color: twoFactorEnabled ? 'var(--danger)' : 'white' }}
                    >
                        {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </button>
                </div>

                {/* Change Password */}
                <h4 style={{ marginBottom: '1rem' }}>Change Password</h4>
                <form onSubmit={handleUpdatePassword}>
                    <div className="grid-cols-2">
                        <div className="input-group">
                            <label className="input-label">Current Password</label>
                            <input 
                                type="password" 
                                className="input-field" 
                                value={passData.currentPassword}
                                onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid-cols-2">
                        <div className="input-group">
                            <label className="input-label">New Password</label>
                            <input 
                                type="password" 
                                className="input-field" 
                                value={passData.newPassword}
                                onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Confirm New Password</label>
                            <input 
                                type="password" 
                                className="input-field" 
                                value={passData.confirmPassword}
                                onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                    {passData.confirmPassword && passData.newPassword !== passData.confirmPassword && (
                        <small style={{ color: 'var(--danger)', marginBottom: '1rem', display: 'block' }}>
                            Passwords do not match
                        </small>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        Update Password
                    </button>
                </form>
            </div>

            {/* Email Change Section */}
            <div className="glass-card">
                 <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    <Mail size={20} /> Change Email Address
                </h3>
                
                {!showEmailOtp ? (
                    <form onSubmit={handleInitiateEmail}>
                        <div className="grid-cols-2">
                            <div className="input-group">
                                <label className="input-label">New Email Address</label>
                                <input 
                                    type="email" 
                                    className="input-field" 
                                    value={emailData.newEmail}
                                    onChange={(e) => setEmailData({...emailData, newEmail: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Current Password</label>
                                <input 
                                    type="password" 
                                    className="input-field" 
                                    value={emailData.password}
                                    onChange={(e) => setEmailData({...emailData, password: e.target.value})}
                                    required
                                    placeholder="Verify identity"
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            Send Verification OTP
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyEmail} className="animate-fade-in">
                        <div style={{ background: 'rgba(255,255,0,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid yellow' }}>
                            <p style={{ margin: 0, color: 'yellow' }}>An OTP has been sent to <strong>{emailData.newEmail}</strong></p>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Enter OTP</label>
                            <input 
                                type="text" 
                                className="input-field" 
                                value={emailData.otp}
                                onChange={(e) => setEmailData({...emailData, otp: e.target.value})}
                                required
                                placeholder="6-digit code"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                Verify & Change Email
                            </button>
                            <button type="button" className="btn btn-outline" onClick={() => setShowEmailOtp(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Settings;
