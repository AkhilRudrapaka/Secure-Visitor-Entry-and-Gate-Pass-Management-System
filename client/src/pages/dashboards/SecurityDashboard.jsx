import { useState, useEffect } from 'react';

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

    const handleEntry = async (code) => {
        try {
            const res = await api.post('/gatepass/entry', { passCode: code });
            alert('Entry Approved: ' + res.data.message);
            // Update scanResult locally to reflect change
            setScanResult(prev => ({
                ...prev,
                data: {
                    ...prev.data,
                    visitorRequest: {
                        ...prev.data.visitorRequest,
                        status: 'checked-in',
                        checkInTime: new Date().toISOString()
                    }
                }
            }));
        } catch (err) {
            alert(err.response?.data?.message || 'Error processing entry');
        }
    };

    const [pendingRequests, setPendingRequests] = useState([]);
    
    // Fetch pending requests on load
    useEffect(() => {
        fetchPendingRequests();
    }, []);
    
    async function fetchPendingRequests() {
        try {
            const { data } = await api.get('/visitors');
            if (data.success) {
                // Filter for pending only
                const pending = data.data.filter(v => v.status === 'pending');
                setPendingRequests(pending);
            }
        } catch (err) {
            console.error('Failed to fetch requests', err);
        }
    }

    const handleApproval = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this request?`)) return;

        try {
            await api.put(`/visitors/${id}`, { status });
            alert(`Request ${status} successfully`);
            fetchPendingRequests(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.message || 'Action failed');
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
                                                <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '2px' }}>Host</p>
                                                <p>{scanResult.data.visitorRequest.host?.name || 'N/A'}</p>
                                            </div>
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '2px' }}>Status</p>
                                                <p style={{ fontWeight: 'bold', color: scanResult.data.visitorRequest.status === 'checked-in' ? 'var(--warning)' : 'var(--success)' }}>
                                                    {scanResult.data.visitorRequest.status.toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '1rem 0' }} />
                                        
                                        {scanResult.data.visitorRequest.status === 'approved' && (
                                            <button 
                                                onClick={() => handleEntry(scanResult.data.passCode)} 
                                                className="btn btn-success" 
                                                style={{ width: '100%', marginTop: '10px' }}
                                            >
                                                Approve Entry (Check-In)
                                            </button>
                                        )}

                                        {scanResult.data.visitorRequest.status === 'checked-in' && (
                                             <div style={{ textAlign: 'center', color: 'var(--warning)', marginTop: '10px' }}>
                                                <strong>Already Checked In</strong>
                                                <br/>
                                                <small>{new Date(scanResult.data.visitorRequest.checkInTime).toLocaleString()}</small>
                                             </div>
                                        )}

                                        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
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

            {/* Pending Requests Section */}
            <div className="animate-fade-in" style={{ marginTop: '3rem' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Pending Visitor Requests <span className="badge" style={{ verticalAlign: 'middle', fontSize: '1rem' }}>{pendingRequests.length}</span></h2>
                
                {pendingRequests.length === 0 ? (
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No pending requests found.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {pendingRequests.map(req => (
                            <div key={req._id} className="glass-card" style={{ position: 'relative' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{req.user.name}</h3>
                                    <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>{req.user.email}</p>
                                </div>
                                
                                <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span className="text-muted">Host:</span>
                                        <span>{req.host?.name || 'N/A'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span className="text-muted">Department:</span>
                                        <span>{req.host?.department || 'N/A'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span className="text-muted">Purpose:</span>
                                        <span>{req.purpose}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span className="text-muted">Date:</span>
                                        <span>{new Date(req.expectedEntryTime).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span className="text-muted">Time:</span>
                                        <span>{new Date(req.expectedEntryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(req.expectedExitTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    {req.additionalGuests > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span className="text-muted">Guests:</span>
                                            <span>+{req.additionalGuests}</span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <button 
                                        className="btn" 
                                        style={{ background: 'var(--danger)', color: '#fff', border: 'none' }}
                                        onClick={() => handleApproval(req._id, 'rejected')}
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        className="btn" 
                                        style={{ background: 'var(--success)', color: '#fff', border: 'none' }}
                                        onClick={() => handleApproval(req._id, 'approved')}
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SecurityDashboard;
