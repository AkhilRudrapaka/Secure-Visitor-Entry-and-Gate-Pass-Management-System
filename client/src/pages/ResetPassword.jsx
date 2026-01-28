import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';
import api from '../api/axios';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/reset-password', {
                token,
                password: formData.password
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem' }}>
                <div className="glass-card" style={{ maxWidth: '450px', textAlign: 'center' }}>
                    <h2 style={{ color: 'var(--danger)' }}>Invalid Reset Link</h2>
                    <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
                        This password reset link is invalid or has expired.
                    </p>
                    <button onClick={() => navigate('/forgot-password')} className="btn btn-primary">
                        Request New Link
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem' }}>
            <div className="glass-card" style={{ maxWidth: '450px', width: '100%' }}>
                {!success ? (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <Lock size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Reset Password</h2>
                            <p style={{ color: 'var(--text-muted)' }}>
                                Enter your new password below
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="input-label">New Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="input-field"
                                    placeholder="Enter new password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="input-field"
                                    placeholder="Confirm new password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {error && (
                                <div style={{
                                    padding: '0.75rem',
                                    background: 'rgba(255, 50, 50, 0.1)',
                                    border: '1px solid var(--danger)',
                                    borderRadius: 'var(--radius)',
                                    color: 'var(--danger)',
                                    marginBottom: '1rem'
                                }}>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                                disabled={loading}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1rem' }} />
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Password Reset Successful!</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Your password has been reset. Redirecting to login...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
