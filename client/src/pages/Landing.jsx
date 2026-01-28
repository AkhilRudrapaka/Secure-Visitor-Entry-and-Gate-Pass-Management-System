import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, QrCode, Shield, CheckCircle } from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div style={{ paddingTop: 'var(--header-height)' }}>
            {/* Hero Section */}
            <section style={{ 
                minHeight: '80vh', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                textAlign: 'center',
                padding: '0 2rem',
                background: 'radial-gradient(circle at top center, rgba(100, 100, 255, 0.1), transparent 70%)'
            }}>
                <div className="animate-fade-in">
                    <span style={{ 
                        color: 'var(--primary)', 
                        fontWeight: 'bold', 
                        fontSize: '0.9rem', 
                        letterSpacing: '2px', 
                        textTransform: 'uppercase',
                        background: 'rgba(100,100,255,0.1)',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px'
                    }}>
                        Secure Campus Entry
                    </span>
                    <h1 style={{ fontSize: '4rem', margin: '1.5rem 0', lineHeight: 1.1 }}>
                        Next-Gen Visitor <br /> 
                        <span className="text-gradient">Management System</span>
                    </h1>
                    <p style={{ maxWidth: '600px', margin: '0 auto 2rem', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                        Eliminate manual registers. Experience seamless, secure, and smart visitor entry with QR-based digital gate passes.
                    </p>
                    <button 
                        onClick={() => navigate('/register')} 
                        className="btn btn-primary" 
                        style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}
                    >
                        Get Started <ArrowRight size={20} />
                    </button>
                </div>
            </section>

            {/* Features */}
            <section className="container" style={{ padding: '4rem 1.5rem' }}>
                <div className="grid-cols-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    <FeatureCard 
                        icon={<QrCode size={40} color="var(--primary)" />}
                        title="QR Code Entry"
                        desc="Instant check-in and check-out using encrypted dynamic QR codes."
                    />
                    <FeatureCard 
                        icon={<Shield size={40} color="var(--success)" />}
                        title="Role-Based Security"
                        desc="Strict access control for Admins, Security, Hosts, and Visitors."
                    />
                    <FeatureCard 
                        icon={<CheckCircle size={40} color="var(--accent)" />}
                        title="Instant Approval"
                        desc="Hosts receive real-time notifications to approve or reject visitors."
                    />
                    <FeatureCard 
                        icon={<Lock size={40} color="var(--warning)" />}
                        title="Data Encryption"
                        desc="AES-256 encryption for all sensitive user data and audit logs."
                    />
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="glass-card">
        <div style={{ marginBottom: '1rem' }}>{icon}</div>
        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)' }}>{desc}</p>
    </div>
);

export default Landing;
