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
            // Note: In real app, the QR provides a JSON string or ID. 
            // Our generator makes a JSON string. The security guard "scanner" (input) would receive that.
            // Ideally, we just check the 'passCode' string in DB.
            const res = await api.post('/gatepass/verify', { passCode });
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
                    <p className="text-muted">Enter QR content manually to simulate scanning</p>
                    
                    <form onSubmit={handleVerify} style={{ marginTop: '1.5rem' }}>
                        <div className="input-group">
                            <input 
                                className="input-field"
                                value={passCode}
                                onChange={(e) => setPassCode(e.target.value)}
                                placeholder="Paste QR Code content here..."
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
                                        <p><strong>Visitor:</strong> {scanResult.data.visitorRequest.user.name}</p>
                                        <p><strong>Host:</strong> {scanResult.data.visitorRequest.host.name}</p>
                                        <p><strong>Valid Until:</strong> {new Date(scanResult.data.validUntil).toLocaleString()}</p>
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
