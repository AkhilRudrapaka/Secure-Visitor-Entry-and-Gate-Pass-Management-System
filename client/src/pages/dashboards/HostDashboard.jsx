import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import api from '../../api/axios';
import { Check, X, Clock, User } from 'lucide-react';

const HostDashboard = () => {
    const { user } = useContext(AuthContext);
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVisits();
    }, []);

    const fetchVisits = async () => {
        try {
            const res = await api.get('/visitors');
            setVisits(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        try {
            await api.put(`/visitors/${id}`, { status });
            fetchVisits(); // Refresh list
        } catch (err) {
            alert('Error updating status');
        }
    };

    const pendingVisits = visits.filter(v => v.status === 'pending');
    const pastVisits = visits.filter(v => v.status !== 'pending');

    return (
        <div className="container" style={{ paddingTop: '100px' }}>
            <h1>Faculty Dashboard</h1>
            <p className="text-muted">Manage visitor requests</p>
            
            <div style={{ marginTop: '2rem' }}>
                <h3>Pending Requests ({pendingVisits.length})</h3>
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                    {pendingVisits.length === 0 && <p className="text-muted">No pending requests.</p>}
                    {pendingVisits.map(visit => (
                        <div key={visit._id} className="glass-card" style={{ borderLeft: '4px solid var(--warning)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4>{visit.user.name} <span style={{ fontWeight: 'normal', fontSize: '0.9rem', color: 'var(--text-muted)' }}>({visit.user.email})</span></h4>
                                    <p>Purpose: {visit.purpose}</p>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                        <Clock size={14} style={{display:'inline', verticalAlign:'middle'}} /> Expected: {new Date(visit.expectedEntryTime).toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => handleAction(visit._id, 'approved')} className="btn" style={{ background: 'var(--success)', color: 'white', padding: '0.5rem' }}>
                                        <Check size={20} /> Approve
                                    </button>
                                    <button onClick={() => handleAction(visit._id, 'rejected')} className="btn" style={{ background: 'var(--danger)', color: 'white', padding: '0.5rem' }}>
                                        <X size={20} /> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: '3rem' }}>
                <h3>History</h3>
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem', opacity: 0.8 }}>
                    {pastVisits.map(visit => (
                        <div key={visit._id} className="glass-card">
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4>{visit.user.name}</h4>
                                    <p>{visit.purpose}</p>
                                </div>
                                <span style={{ color: visit.status === 'approved' ? 'var(--success)' : 'var(--danger)' }}>
                                    {visit.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HostDashboard;
