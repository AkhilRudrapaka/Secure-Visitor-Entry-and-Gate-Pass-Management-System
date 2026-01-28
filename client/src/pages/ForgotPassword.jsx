import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../api/axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            setSuccess(true);
            setMessage(data.message || 'Password reset link sent to your email!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem' }}>
            <div className="glass-card" style={{ maxWidth: '450px', width: '100%' }}>
                {!success ? (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <Mail size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Forgot Password?</h2>
                            <p style={{ color: 'var(--text-muted)' }}>
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="input-label">Email Address</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                style={{ width: '100%', marginBottom: '1rem' }}
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>

                            <Link to="/login" style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                gap: '0.5rem',
                                color: 'var(--text-muted)', 
                                textDecoration: 'none',
                                fontSize: '0.9rem'
                            }}>
                                <ArrowLeft size={16} /> Back to Login
                            </Link>
                        </form>
                    </>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1rem' }} />
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Check Your Email</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            {message}
                        </p>
                        <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                            Return to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
