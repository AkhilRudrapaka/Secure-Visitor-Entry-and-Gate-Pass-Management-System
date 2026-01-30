import { useState } from 'react';
import api from '../../api/axios';
import { Scan, Search, CheckCircle, XCircle } from 'lucide-react';

const SecurityDashboard = () => {
    const [passCode, setPassCode] = useState(''); // This would be the content scanned from QR
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setScanResult(null);

        try {
            let codeToSubmit = passCode;
            try {
                // Try to parse if it's the JSON string from QR
                const parsed = JSON.parse(passCode);
                if (parsed.id) codeToSubmit = parsed.id;
            } catch (e) {
                // Not JSON, use as is (manual entry of short code)
            }

            const res = await api.post('/gatepass/verify', { passCode: codeToSubmit });
            setScanResult({ success: true, data: res.data.data });
        } catch (err) {
            setScanResult({ success: false, message: err.response?.data?.message || 'Invalid Pass' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '100px' }}>
            <h1>Security Control</h1>
            
            <div className="flex-center" style={{ margin: '2rem 0' }}>
                <div className="glass-card" style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
                    <Scan size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h2>Scan Gate Pass</h2>
                    <p className="text-muted">Use a collection device or enter Code manually</p>
                    
                    <form onSubmit={handleVerify} style={{ marginTop: '1.5rem' }}>
                        <div className="input-group">
                            <input 
                                className="input-field"
                                value={passCode}
                                onChange={(e) => setPassCode(e.target.value)}
                                placeholder="Scan or Enter Code..."
                                style={{ textAlign: 'center', fontFamily: 'monospace' }}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify Access'}
                        </button>
                    </form>

                    {scanResult && (
                        <div className="animate-fade-in" style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '12px', background: scanResult.success ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)', border: `1px solid ${scanResult.success ? 'var(--success)' : 'var(--danger)'}` }}>
                            {scanResult.success ? (
                                <div>
                                    <CheckCircle size={40} color="var(--success)" style={{ marginBottom: '10px' }} />
                                    <h3 style={{ color: 'var(--success)', margin: 0 }}>ACCESS GRANTED</h3>
                                    <div style={{ textAlign: 'left', marginTop: '1rem', color: '#fff' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div>
                                                <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '2px' }}>Name</p>
                                                <p style={{ fontWeight: 'bold' }}>{scanResult.data.visitorRequest.user.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '2px' }}>Role</p>
                                                <p style={{ textTransform: 'capitalize' }}>{scanResult.data.visitorRequest.user.role}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '2px' }}>Purpose</p>
                                                <p>{scanResult.data.visitorRequest.purpose}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '2px' }}>Host/Faculty</p>
                                                <p>{scanResult.data.visitorRequest.host?.name || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '1rem 0' }} />
                                        <p style={{ textAlign: 'center' }}>
                                            <strong>Valid Until:</strong> <br/>
                                            {new Date(scanResult.data.validUntil).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <XCircle size={40} color="var(--danger)" style={{ marginBottom: '10px' }} />
                                    <h3 style={{ color: 'var(--danger)', margin: 0 }}>ACCESS DENIED</h3>
                                    <p>{scanResult.message}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SecurityDashboard;
