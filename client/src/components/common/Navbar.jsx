import { Link } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import AuthContext from '../../context/AuthContext';
import { ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <nav className="glass" style={{
            height: 'var(--header-height)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem'
        }}>
            <Link 
                to="/" 
                onClick={(e) => {
                    if (user) {
                        e.preventDefault(); // Prevent navigation to home
                        window.location.reload(); // Refresh current page
                    }
                }}
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                <ShieldCheck size={32} color="var(--primary)" />
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                    Secure<span className="text-gradient">Gate</span>
                </span>
            </Link>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {!user ? (
                    <>
                        <Link to="/login" className="btn btn-outline" style={{ textDecoration: 'none' }}>Login</Link>
                        <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Get Started</Link>
                    </>
                ) : (
                    <>
                         <div style={{ color: 'white', marginRight: '1rem', fontSize: '0.9rem', textAlign: 'right', lineHeight: '1.2' }}>
                            <div style={{ fontWeight: 'bold' }}>{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            <div>{currentTime.toLocaleTimeString()}</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <UserIcon size={20} color="var(--text-muted)" />
                            <span style={{ color: 'white' }}>{user.name}</span>
                            <span style={{ 
                                background: 'rgba(255,255,255,0.1)', 
                                padding: '2px 8px', 
                                borderRadius: '12px', 
                                fontSize: '0.8rem',
                                color: 'var(--primary)'
                            }}>
                                {user.role.toUpperCase()}
                            </span>
                        </div>
                        <button onClick={logout} className="btn" style={{ background: 'rgba(255,50,50,0.2)', color: 'var(--danger)' }}>
                            <LogOut size={18} /> Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
