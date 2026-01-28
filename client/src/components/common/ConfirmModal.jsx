import { motion, AnimatePresence } from 'framer-motion';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card"
                        style={{
                            background: '#1a1a2e',
                            padding: '2rem',
                            borderRadius: '16px',
                            maxWidth: '400px',
                            width: '90%',
                            textAlign: 'center',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <h3 style={{ color: 'white', marginBottom: '1rem' }}>{title || 'Are you sure?'}</h3>
                        <p style={{ color: '#ccc', marginBottom: '2rem' }}>{message}</p>
                        
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button 
                                onClick={onCancel}
                                className="btn"
                                style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={onConfirm}
                                className="btn"
                                style={{ background: 'var(--danger)', color: 'white' }}
                            >
                                Yes, Proceed
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
