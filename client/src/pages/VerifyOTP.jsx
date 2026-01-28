import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import api from '../api/axios';

const VerifyOTP = () => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const email = localStorage.getItem('tempEmail'); // Stored during login

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/verify-otp', { email, otp });
            
            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.removeItem('tempEmail');
            
            // Redirect to dashboard
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await api.post('/auth/resend-otp', { email });
            alert('New OTP sent to your email!');
        } catch (err) {
            setError('Failed to resend OTP');
        }
    };

    if (!email) {
        navigate('/login');
        return null;
    }

    return (
        <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem' }}>
            <div className="glass-card" style={{ maxWidth: '450px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Shield size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Verify Your Identity</h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        We've sent a 6-digit code to <strong>{email}</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Enter OTP Code</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            required
                            style={{ 
                                textAlign: 'center', 
                                fontSize: '1.5rem', 
                                letterSpacing: '0.5rem',
                                fontWeight: 'bold'
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            background: 'rgba(255, 50, 50, 0.1)',
                            border: '1px solid var(--danger)',
                            borderRadius: 'var(--radius)',
                            color: 'var(--danger)',
                            marginBottom: '1rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginBottom: '1rem' }}
                        disabled={loading || otp.length !== 6}
                    >
                        {loading ? 'Verifying...' : 'Verify & Login'}
                    </button>

                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <button
                            type="button"
                            onClick={handleResend}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary)',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontSize: '0.9rem'
                            }}
                        >
                            Resend OTP
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            localStorage.removeItem('tempEmail');
                            navigate('/login');
                        }}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        <ArrowLeft size={16} /> Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyOTP;
