import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import { Mail, Lock, Loader, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('visitor'); // Optional: Helps if multi-role logic needed locally, but API dictates
    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bgLoading, setBgLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setBgLoading(true);
        
        try {
            const { data } = await api.post('/auth/login', { email, password });
            
            // Check if OTP is required
            if (data.requiresOTP) {
                localStorage.setItem('tempEmail', email);
                navigate('/verify-otp');
            } else {
                // Normal login - store token and user
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            setBgLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', paddingTop: 'var(--header-height)' }}>
            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h2>
                
                {error && <div style={{ 
                    background: 'rgba(255,50,50,0.2)', 
                    color: 'var(--danger)', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    textAlign: 'center'
                }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                            <input 
                                type="email" 
                                className="input-field" 
                                style={{ paddingLeft: '40px' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="input-field" 
                                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ 
                                    position: 'absolute', right: '12px', top: '12px', 
                                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' 
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                        <Link to="/forgot-password" style={{ 
                            color: 'var(--primary)', 
                            textDecoration: 'none',
                            fontSize: '0.9rem'
                        }}>
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={bgLoading}>
                        {bgLoading ? <Loader className="animate-spin" /> : 'Login'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)' }}>Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
