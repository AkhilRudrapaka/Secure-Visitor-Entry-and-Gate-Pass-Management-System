import { useState, useEffect, useContext } from 'react';
import api from '../../api/axios';
import { Users, FileText, Activity } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalVisits: 0, activePasses: 0 });
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [pendingVisits, setPendingVisits] = useState([]);
    const [activeTab, setActiveTab] = useState('requests'); // Default to requests as it's actionable

    useEffect(() => {
        fetchData();
        fetchPendingVisits();
    }, []);

    const fetchData = async () => {
        try {
            const statsRes = await api.get('/admin/stats');
            setStats(statsRes.data.data);
            
            const logsRes = await api.get('/admin/logs');
            setLogs(logsRes.data.data);

            const usersRes = await api.get('/admin/users');
            setUsers(usersRes.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPendingVisits = async () => {
        try {
            const res = await api.get('/visitors');
            // Filter strictly for pending if API returns all, or assuming API returns all for admin
            const pending = res.data.data.filter(v => v.status === 'pending');
            setPendingVisits(pending);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAction = async (id, status) => {
        try {
            await api.put(`/visitors/${id}`, { status });
            fetchPendingVisits();
            fetchData(); // Refresh stats/logs
        } catch (err) {
            alert('Error updating status');
        }
    };

    return (
        <div className="container" style={{ paddingTop: '100px' }}>
            <h1>System Overview</h1>
            
            {/* Stats Cards */}
            <div className="grid-cols-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-card">
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
                        <Users size={32} color="var(--primary)" />
                        <div>
                            <h3 style={{ margin: 0 }}>{stats.totalUsers}</h3>
                            <p className="text-muted" style={{ margin: 0 }}>Total Users</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card">
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
                        <FileText size={32} color="var(--secondary)" />
                        <div>
                            <h3 style={{ margin: 0 }}>{stats.totalVisits}</h3>
                            <p className="text-muted" style={{ margin: 0 }}>Total Visits</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card">
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
                        <Activity size={32} color="var(--success)" />
                        <div>
                            <h3 style={{ margin: 0 }}>{stats.activePasses}</h3>
                            <p className="text-muted" style={{ margin: 0 }}>Active Passes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <button 
                    className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('requests')}
                >
                    Requests ({pendingVisits.length})
                </button>
                <button 
                    className={`btn ${activeTab === 'logs' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('logs')}
                >
                    Audit Logs
                </button>
                <button 
                    className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('users')}
                >
                    User Management
                </button>
            </div>

            {/* Content */}
            <div className="glass-card" style={{ overflowX: 'auto' }}>
                {activeTab === 'requests' && (
                    <div style={{ padding: '0.5rem' }}>
                         {pendingVisits.length === 0 ? <p className="text-muted">No pending requests.</p> : (
                             <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '1rem' }}>Visitor</th>
                                        <th style={{ padding: '1rem' }}>Host</th>
                                        <th style={{ padding: '1rem' }}>Time</th>
                                        <th style={{ padding: '1rem' }}>Purpose</th>
                                        <th style={{ padding: '1rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingVisits.map(v => (
                                        <tr key={v._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem' }}>{v.user.name}</td>
                                            <td style={{ padding: '1rem' }}>{v.host.name}</td>
                                            <td style={{ padding: '1rem' }}>{new Date(v.expectedEntryTime).toLocaleString()}</td>
                                            <td style={{ padding: '1rem' }}>{v.purpose}</td>
                                            <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleAction(v._id, 'approved')} className="btn" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', background: 'var(--success)' }}>Approve</button>
                                                <button onClick={() => handleAction(v._id, 'rejected')} className="btn" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', background: 'var(--danger)' }}>Reject</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                         )}
                    </div>
                )}

                {activeTab === 'logs' && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '1rem' }}>Time</th>
                                <th style={{ padding: '1rem' }}>User</th>
                                <th style={{ padding: '1rem' }}>Action</th>
                                <th style={{ padding: '1rem' }}>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {log.user ? `${log.user.name} (${log.user.role})` : 'System/Guest'}
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--accent)' }}>{log.action}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{JSON.stringify(log.details)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'users' && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '1rem' }}>Name</th>
                                <th style={{ padding: '1rem' }}>Email</th>
                                <th style={{ padding: '1rem' }}>Role</th>
                                <th style={{ padding: '1rem' }}>Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>{u.name}</td>
                                    <td style={{ padding: '1rem' }}>{u.email}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ 
                                            padding: '4px 8px', borderRadius: '10px', 
                                            background: u.role === 'admin' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                            fontSize: '0.8rem'
                                        }}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{u.phone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
