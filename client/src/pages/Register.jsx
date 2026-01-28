import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { User, Mail, Lock, Phone, Briefcase, Eye, EyeOff, Check, X } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'student',
        department: ''
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Password Strength Logic
    const calculateStrength = (pass) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1; // Uppercase
        if (/[0-9]/.test(pass)) score += 1; // Number
        if (/[^A-Za-z0-9]/.test(pass)) score += 1; // Special Char
        return score;
    };
    
    const strengthScore = calculateStrength(formData.password);
    const getStrengthColor = () => {
        if (strengthScore <= 1) return 'var(--danger)';
        if (strengthScore === 2) return 'var(--warning)';
        if (strengthScore === 3) return 'orange';
        return 'var(--success)';
    };
    
    const { register, error } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const { name, email, password, confirmPassword, phone, role, department } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (password !== confirmPassword) {
            alert("Passwords do not match"); // Ideally use setErr or toast
            return;
        }
        if (strengthScore < 4) { // Enforce strong password
             alert("Password must be at least 8 characters long and include numbers and special symbols.");
             return;
        }

        setLoading(true);
        const success = await register({ ...formData, confirmPassword: undefined }); // Don't send confirmPass to backend
        if (success) {
            navigate('/dashboard');
        } else {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '50px' }}>
            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>
                
                {error && <div style={{ 
                    background: 'rgba(255,50,50,0.2)', color: 'var(--danger)', 
                    padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center'
                }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                            <input name="name" type="text" className="input-field" style={{ paddingLeft: '40px' }} value={name} onChange={onChange} required />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                            <input name="email" type="email" className="input-field" style={{ paddingLeft: '40px' }} value={email} onChange={onChange} required />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Phone Number</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                            <input name="phone" type="text" className="input-field" style={{ paddingLeft: '40px' }} value={phone} onChange={onChange} required />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                            <input 
                                name="password" 
                                type={showPassword ? "text" : "password"} 
                                className="input-field" 
                                style={{ paddingLeft: '40px', paddingRight: '40px' }} 
                                value={password} 
                                onChange={onChange} 
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
                        
                        {/* Password Strength Meter */}
                        {password && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '5px', height: '4px', marginBottom: '5px' }}>
                                    {[1, 2, 3, 4].map((step) => (
                                        <div key={step} style={{ 
                                            flex: 1, 
                                            background: strengthScore >= step ? getStrengthColor() : 'rgba(255,255,255,0.1)',
                                            borderRadius: '2px',
                                            transition: 'background 0.3s'
                                        }} />
                                    ))}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <span style={{ color: password.length >= 8 ? 'var(--success)' : 'inherit' }}>
                                        {password.length >= 8 ? <Check size={10} /> : <X size={10} />} 8+ Chars
                                    </span>
                                    <span style={{ color: /[^A-Za-z0-9]/.test(password) ? 'var(--success)' : 'inherit' }}>
                                        {/[^A-Za-z0-9]/.test(password) ? <Check size={10} /> : <X size={10} />} Special Symbol
                                    </span>
                                     <span style={{ color: /[0-9]/.test(password) ? 'var(--success)' : 'inherit' }}>
                                        {/[0-9]/.test(password) ? <Check size={10} /> : <X size={10} />} Number
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="input-group">
                        <label className="input-label">Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                            <input 
                                name="confirmPassword" 
                                type={showConfirmPassword ? "text" : "password"} 
                                className="input-field" 
                                style={{ paddingLeft: '40px', paddingRight: '40px' }} 
                                value={confirmPassword} 
                                onChange={onChange} 
                                required 
                            />
                             <button 
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{ 
                                    position: 'absolute', right: '12px', top: '12px', 
                                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' 
                                }}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Role</label>
                        <select name="role" className="input-field" value={role} onChange={onChange} style={{ cursor: 'pointer' }}>
                            <option value="student">Student</option>
                            <option value="visitor">Visitor (Parent/Guest)</option>
                            <option value="host">Host</option>
                            <option value="faculty">Faculty</option>
                            <option value="security">Security Staff</option>
                            <option value="admin">Administrator</option>
                        </select>
                        <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '5px' }}>
                            * Admin registration requires special access.
                        </small>
                    </div>

                    {(role === 'host' || role === 'faculty') && (
                        <div className="input-group">
                            <label className="input-label">Department</label>
                            <div style={{ position: 'relative' }}>
                                <Briefcase size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                                <input name="department" type="text" className="input-field" style={{ paddingLeft: '40px' }} value={department} onChange={onChange} required />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Creating...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
