
import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import api from '../../api/axios';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Calendar, Clock, User, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../components/common/ConfirmModal';

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [visits, setVisits] = useState([]);
    const [hosts, setHosts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    
    // Helper for date inputs
    const getLocalISOString = (date) => {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    };

    // Form State
    const [formData, setFormData] = useState({
        hostId: '', // For student, this could be Warden/Faculty
        purpose: 'Outing',
        expectedEntryTime: getLocalISOString(new Date()),
        expectedExitTime: getLocalISOString(new Date(Date.now() + 4 * 60 * 60 * 1000)), // +4 hours default
        additionalGuests: 0
    });
    
    // QR Modal State
    const [activeQR, setActiveQR] = useState(null);
    const [activeCode, setActiveCode] = useState(null);

    // Confirm Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [cancelVisitId, setCancelVisitId] = useState(null);

    useEffect(() => {
        fetchVisits();
        fetchHosts();
    }, []);

    const fetchVisits = async () => {
        try {
            // Reusing visitors endpoint for now as logical "visits/requests"
            const res = await api.get('/visitors');
            setVisits(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchHosts = async () => {
        try {
            // Students request passes from Wardens/Hosts
            const res = await api.get('/users/hosts');
            setHosts(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleGeneratePass = async (visitId) => {
        try {
            const res = await api.post('/gatepass/generate', { visitId });
            setActiveQR(res.data.qrCode);
            setActiveCode(res.data.uniqueCode);
        } catch (err) {
            alert(err.response?.data?.message || 'Error generating pass');
        }
    };

    const initiateCancel = (visitId) => {
        setCancelVisitId(visitId);
        setConfirmOpen(true);
    };

    const confirmCancel = async () => {
        if (!cancelVisitId) return;
        try {
            await api.put(`/visitors/${cancelVisitId}`, { status: 'cancelled' });
            fetchVisits();
            setConfirmOpen(false);
            setCancelVisitId(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Error cancelling request');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/visitors', formData);
            setShowForm(false);
            fetchVisits();
            setFormData({ hostId: '', purpose: 'Outing', expectedEntryTime: '', expectedExitTime: '', additionalGuests: 0 });
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating request');
        }
    };

    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '50px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Student Portal</h1>
                    <p className="text-muted">Apply for Gate Passes (Outing / Leave)</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <Plus size={20} /> Apply for Pass
                </button>
            </div>

            {/* Request Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass-card"
                        style={{ marginBottom: '2rem', overflow: 'hidden' }}
                    >
                        <h3>Apply for Gate Pass</h3>
                        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
                            <div className="grid-cols-2">
                                <div className="input-group">
                                    <label className="input-label">Approving Faculty</label>
                                    <select 
                                        className="input-field" 
                                        value={formData.hostId} 
                                        onChange={e => setFormData({...formData, hostId: e.target.value})}
                                        required
                                    >
                                        <option value="">-- Select Faculty --</option>
                                        {hosts.map(h => (
                                            <option key={h._id} value={h._id}>{h.name} ({h.department})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Reason</label>
                                    <input 
                                        className="input-field" 
                                        type="text" 
                                        value={formData.purpose} 
                                        onChange={e => setFormData({...formData, purpose: e.target.value})}
                                        required 
                                        placeholder="e.g. Weekend Outing, Medical"
                                    />
                                </div>
                            </div>
                            <div className="grid-cols-2">
                                <div className="input-group">
                                    <label className="input-label">Details</label>
                                    <input 
                                        className="input-field" 
                                        value={formData.additionalGuests}
                                        onChange={e => setFormData({...formData, additionalGuests: e.target.value})} // Using this field for extra details temporarily or keeping as 0
                                        placeholder="Additional Details (Optional)"
                                        type="text"
                                    /> 
                                </div>
                            </div>
                            <div className="grid-cols-2">
                                <div className="input-group">
                                    <label className="input-label">Leaving Time</label>
                                    <input 
                                        className="input-field" 
                                        type="datetime-local" 
                                        value={formData.expectedEntryTime} // Using Entry as "Start Time"
                                        onChange={e => setFormData({...formData, expectedEntryTime: e.target.value})}
                                        required 
                                        min={getLocalISOString(new Date())}
                                        max="9999-12-31T23:59"
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Return Time</label>
                                    <input 
                                        className="input-field" 
                                        type="datetime-local" 
                                        value={formData.expectedExitTime} // Using Exit as "End Time"
                                        onChange={e => setFormData({...formData, expectedExitTime: e.target.value})}
                                        required 
                                        min={formData.expectedEntryTime || getLocalISOString(new Date())}
                                        max="9999-12-31T23:59"
                                    />
                                </div>
                            </div>
                            <button className="btn btn-primary" type="submit">Submit Application</button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Request List */}
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {visits.length === 0 ? <p>No pass applications found.</p> : visits.map(visit => (
                    <div key={visit._id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>Request to: {visit.host?.name || 'Unknown Faculty'}</h3>
                            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <span className="flex-center"><Calendar size={14} style={{ marginRight: '5px' }} /> {new Date(visit.expectedEntryTime).toLocaleDateString()}</span>
                                <span className="flex-center"><Clock size={14} style={{ marginRight: '5px' }} /> {new Date(visit.expectedEntryTime).toLocaleTimeString()} - {new Date(visit.expectedExitTime).toLocaleTimeString()}</span>
                            </div>
                            <p style={{ marginTop: '0.5rem' }}>Reason: {visit.purpose}</p>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ 
                                padding: '5px 10px', 
                                borderRadius: '15px', 
                                background: visit.status === 'approved' ? 'rgba(0,255,0,0.1)' : visit.status === 'rejected' || visit.status === 'cancelled' ? 'rgba(255,0,0,0.1)' : 'rgba(255,255,0,0.1)',
                                color: visit.status === 'approved' ? 'var(--success)' : visit.status === 'rejected' || visit.status === 'cancelled' ? 'var(--danger)' : 'var(--warning)',
                                fontWeight: 'bold'
                            }}>
                                {visit.status.toUpperCase()}
                            </span>
                            
                            {visit.status === 'approved' && (
                                <div style={{ marginTop: '1rem' }}>
                                    <button onClick={() => handleGeneratePass(visit._id)} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                        <QrCode size={16} /> View Gate Pass
                                    </button>
                                </div>
                            )}
                            
                            {visit.status === 'pending' && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <button onClick={() => initiateCancel(visit._id)} className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                                        Cancel Request
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* QR View Modal */}
            {activeQR && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div className="glass-card" style={{ background: 'white', padding: '2rem', borderRadius: '20px', textAlign: 'center' }}>
                        <h2 style={{ color: 'black', marginBottom: '1rem' }}>Student Gate Pass</h2>
                        <img src={activeQR} alt="Gate Pass QR" style={{ width: '250px', height: '250px' }} />
                        
                         <div style={{ marginTop: '1rem', background: '#f5f5f5', padding: '10px 20px', borderRadius: '10px', display: 'inline-block' }}>
                            <p style={{ color: '#555', margin: 0, fontSize: '0.9rem' }}>Pass Code</p>
                            <h2 style={{ color: 'var(--primary)', margin: 0, letterSpacing: '2px' }}>{activeCode}</h2>
                        </div>

                        <p style={{ color: '#555', marginTop: '1rem' }}>Show this to security at the gate.</p>
                        <button className="btn btn-primary" onClick={() => setActiveQR(null)} style={{ marginTop: '1rem' }}>Close</button>
                    </div>
                </div>
            )}
            
            <ConfirmModal 
                isOpen={confirmOpen}
                title="Cancel Request"
                message="Are you sure you want to cancel this gate pass request? This action cannot be undone."
                onConfirm={confirmCancel}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    );
};

export default StudentDashboard;
