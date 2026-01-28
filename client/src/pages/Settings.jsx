import { useState, useEffect, useContext } from 'react';
import { Shield, Check, X } from 'lucide-react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const Settings = () => {
    const { user } = useContext(AuthContext);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Fetch current 2FA status
        const fetchUser = async () => {
            try {
                const { data } = await api.get('/auth/me');
                setTwoFactorEnabled(data.data.twoFactorEnabled || false);
            } catch (err) {
                console.error(err);
            }
        };
        fetchUser();
    }, []);

    const handleToggle2FA = async () => {
        setLoading(true);
        setMessage('');

        try {
            const { data } = await api.put('/auth/toggle-2fa');
            setTwoFactorEnabled(data.twoFactorEnabled);
            setMessage(data.message);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to update 2FA');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '2rem' }}>Security Settings</h1>

            <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <Shield size={32} color="var(--primary)" />
                    <div style={{ flex: 1 }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>Two-Factor Authentication (2FA)</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Add an extra layer of security by requiring an OTP code sent to your email during login.
                        </p>
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius)',
                        background: twoFactorEnabled ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                        border: `1px solid ${twoFactorEnabled ? 'var(--success)' : 'var(--danger)'}`
                    }}>
                        {twoFactorEnabled ? (
                            <>
                                <Check size={18} color="var(--success)" />
                                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Enabled</span>
                            </>
                        ) : (
                            <>
                                <X size={18} color="var(--danger)" />
                                <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Disabled</span>
                            </>
                        )}
                    </div>
                </div>

                {message && (
                    <div style={{
                        padding: '0.75rem',
                        background: 'rgba(100, 100, 255, 0.1)',
                        border: '1px solid var(--primary)',
                        borderRadius: 'var(--radius)',
                        color: 'var(--primary)',
                        marginBottom: '1rem',
                        textAlign: 'center'
                    }}>
                        {message}
                    </div>
                )}

                <button
                    onClick={handleToggle2FA}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={loading}
                >
                    {loading ? 'Updating...' : (twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA')}
                </button>

                {twoFactorEnabled && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'rgba(100, 100, 255, 0.05)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid rgba(100, 100, 255, 0.2)'
                    }}>
                        <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>How it works:</h4>
                        <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', paddingLeft: '1.5rem' }}>
                            <li>When you log in, you'll enter your email and password as usual</li>
                            <li>A 6-digit OTP code will be sent to <strong>{user?.email}</strong></li>
                            <li>Enter the OTP code to complete your login</li>
                            <li>The code expires in 5 minutes</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
