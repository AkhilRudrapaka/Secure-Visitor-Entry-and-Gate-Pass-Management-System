
import React from 'react';
import { Shield, Check, X, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const AccessControlMatrix = () => {
    const roles = [
        { name: 'Admin', color: 'var(--primary)' },
        { name: 'Faculty', color: 'var(--secondary)' },
        { name: 'Security', color: 'var(--warning)' },
        { name: 'Student', color: 'var(--accent)' },
        { name: 'Visitor', color: '#64748b' }
    ];

    const objects = [
        { name: 'User Management', icon: <UserLockIcon /> },
        { name: 'Gate Pass Request', icon: <PassIcon /> },
        { name: 'Pass Approval', icon: <StampIcon /> },
        { name: 'Scanners', icon: <ScanIcon /> },
        { name: 'System Logs', icon: <LogIcon /> }
    ];

    // C = Create, R = Read, U = Update, D = Delete
    // A mapping of Role -> Object -> Permissions
    const aclData = {
        'Admin': {
            'User Management': ['C', 'R', 'U', 'D'],
            'Gate Pass Request': [],
            'Pass Approval': [],
            'Scanners': [],
            'System Logs': ['R']
        },
        'Faculty': {
            'User Management': [],
            'Gate Pass Request': [],
            'Pass Approval': ['A'], // Approve
            'Scanners': [],
            'System Logs': []
        },
        'Security': {
            'User Management': [],
            'Gate Pass Request': [],
            'Pass Approval': [],
            'Scanners': ['R', 'V'], // Read, Verify
            'System Logs': []
        },
        'Student': {
            'User Management': ['R (Self)'],
            'Gate Pass Request': ['C', 'R'],
            'Pass Approval': [],
            'Scanners': [],
            'System Logs': []
        },
        'Visitor': {
            'User Management': ['R (Self)'],
            'Gate Pass Request': ['C', 'R'],
            'Pass Approval': [],
            'Scanners': [],
            'System Logs': []
        }
    };

    const getCellContent = (role, object) => {
        const perms = aclData[role]?.[object];
        if (!perms || perms.length === 0) {
            return <X size={16} style={{ opacity: 0.2 }} />;
        }
        return (
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {perms.map((p, i) => (
                    <span key={i} title={getPermissionLabel(p)} style={{
                        fontSize: '0.7rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: getPermissionColor(p),
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'help'
                    }}>
                        {p}
                    </span>
                ))}
            </div>
        );
    };

    const getPermissionColor = (p) => {
        switch (p) {
            case 'C': return 'var(--success)'; // Create
            case 'R': return 'var(--primary)'; // Read
            case 'U': return 'var(--warning)'; // Update
            case 'D': return 'var(--danger)';  // Delete
            case 'A': return 'var(--accent)';  // Approve
            case 'V': return 'var(--secondary)'; // Verify
            default: return '#64748b';
        }
    };

    const getPermissionLabel = (p) => {
        const labels = {
            'C': 'Create', 'R': 'Read', 'U': 'Update', 'D': 'Delete',
            'A': 'Approve', 'V': 'Verify', 'R (Self)': 'Read Self Profile'
        };
        return labels[p] || p;
    };

    return (
        <div className="w-full" style={{ overflowX: 'auto', padding: '10px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Shield style={{ verticalAlign: 'middle', marginRight: '10px', color: 'var(--primary)' }} />
                Access Control Matrix (ACL)
            </h2>
            
            <table style={{ 
                width: '100%', 
                borderCollapse: 'separate', 
                borderSpacing: '0 8px',
                minWidth: '600px'
            }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)' }}>ROLE / OBJECT</th>
                        {objects.map((obj, i) => (
                            <th key={i} style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <div className="flex-center" style={{ flexDirection: 'column', gap: '5px' }}>
                                    {obj.icon}
                                    {obj.name}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {roles.map((role, i) => (
                        <motion.tr 
                            key={role.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card"
                            style={{ background: 'rgba(255,255,255,0.03)' }}
                        >
                            <td style={{ padding: '1.5rem 1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ 
                                    width: '10px', 
                                    height: '10px', 
                                    borderRadius: '50%', 
                                    background: role.color,
                                    boxShadow: `0 0 10px ${role.color}`
                                }}></div>
                                <span style={{ fontWeight: 'bold', color: role.color }}>{role.name}</span>
                            </td>
                            {objects.map((obj, j) => (
                                <td key={j} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                    {getCellContent(role.name, obj.name)}
                                </td>
                            ))}
                        </motion.tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <LegendBadge label="C" desc="Create" color="var(--success)" />
                <LegendBadge label="R" desc="Read" color="var(--primary)" />
                <LegendBadge label="U" desc="Update" color="var(--warning)" />
                <LegendBadge label="D" desc="Delete" color="var(--danger)" />
                <LegendBadge label="A" desc="Approve" color="var(--accent)" />
                <LegendBadge label="V" desc="Verify" color="var(--secondary)" />
            </div>
        </div>
    );
};

// Simple Icons
const UserLockIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle><rect x="16" y="11" width="6" height="4" rx="1"></rect></svg>;
const PassIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const StampIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const ScanIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><rect x="7" y="7" width="10" height="10" rx="2"></rect><path d="M7 12h10"></path></svg>;
const LogIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;

const LegendBadge = ({ label, desc, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ 
            background: color, 
            color: 'white', 
            padding: '2px 6px', 
            borderRadius: '4px', 
            fontWeight: 'bold' 
        }}>
            {label}
        </span>
        <span>= {desc}</span>
    </div>
);

export default AccessControlMatrix;
