import React, { useState, useEffect } from 'react';
import { Building, LogOut, Key, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Account = () => {
    const navigate = useNavigate();
    const [clientName, setClientName] = useState('');
    const [clientLoginId, setClientLoginId] = useState('');

    useEffect(() => {
        setClientName(localStorage.getItem('clientName') || 'Valued Client');
        setClientLoginId(localStorage.getItem('clientLoginId') || 'user@example.com');
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Password change state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    const handlePasswordChange = (e) => {
        e.preventDefault();

        // Validation
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match!' });
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long!' });
            return;
        }

        // TODO: Implement actual password change API call
        // For now, just show success message
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });

        // Clear message after 3 seconds
        setTimeout(() => setPasswordMessage({ type: '', text: '' }), 3000);
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', paddingBottom: '5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                    Account Settings
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                    Manage your account information and security
                </p>
            </div>

            {/* Profile Card */}
            <div style={{
                background: '#ffffff',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: '700'
                }}>
                    {clientName.charAt(0)}
                </div>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>{clientName}</h2>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>GSTIN: 27AAAAA0000A1Z5</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Company Details */}
                <section style={{
                    background: '#ffffff',
                    borderRadius: '0.75rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e2e8f0',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Building size={20} style={{ color: '#3b82f6' }} />
                        Company Details
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#0f172a' }}>Company Name</label>
                            <input
                                style={{
                                    width: '100%',
                                    padding: '0.625rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    background: '#f8fafc',
                                    color: '#64748b'
                                }}
                                value={clientName}
                                readOnly
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#0f172a' }}>Registered Address</label>
                            <input
                                style={{
                                    width: '100%',
                                    padding: '0.625rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    background: '#f8fafc',
                                    color: '#64748b'
                                }}
                                value="123, Logistics Park, Mumbai"
                                readOnly
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#0f172a' }}>Contact Login ID</label>
                            <input
                                style={{
                                    width: '100%',
                                    padding: '0.625rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    background: '#f8fafc',
                                    color: '#64748b'
                                }}
                                value={clientLoginId}
                                readOnly
                            />
                        </div>
                    </div>
                </section>

                {/* Security - Password Change */}
                <section style={{
                    background: '#ffffff',
                    borderRadius: '0.75rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e2e8f0',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Lock size={20} style={{ color: '#3b82f6' }} />
                        Security & Password
                    </h3>

                    <form onSubmit={handlePasswordChange}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                            {/* Current Password */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#0f172a' }}>
                                    Current Password *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem 2.5rem 0.625rem 0.625rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        required
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('current')}
                                        style={{
                                            position: 'absolute',
                                            right: '0.625rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#64748b'
                                        }}
                                    >
                                        {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#0f172a' }}>
                                    New Password *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem 2.5rem 0.625rem 0.625rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        required
                                        placeholder="Enter new password"
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('new')}
                                        style={{
                                            position: 'absolute',
                                            right: '0.625rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#64748b'
                                        }}
                                    >
                                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#0f172a' }}>
                                    Confirm New Password *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem 2.5rem 0.625rem 0.625rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        required
                                        placeholder="Confirm new password"
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                        style={{
                                            position: 'absolute',
                                            right: '0.625rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#64748b'
                                        }}
                                    >
                                        {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Password Message */}
                        {passwordMessage.text && (
                            <div style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '0.5rem',
                                marginBottom: '1rem',
                                fontSize: '0.875rem',
                                background: passwordMessage.type === 'success' ? '#d1fae5' : '#fee2e2',
                                color: passwordMessage.type === 'success' ? '#065f46' : '#991b1b',
                                border: `1px solid ${passwordMessage.type === 'success' ? '#10b981' : '#ef4444'}`
                            }}>
                                {passwordMessage.text}
                            </div>
                        )}

                        {/* Password Requirements */}
                        <div style={{
                            background: '#f8fafc',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1rem',
                            fontSize: '0.75rem',
                            color: '#64748b'
                        }}>
                            <strong>Password Requirements:</strong>
                            <ul style={{ marginTop: '0.5rem', marginLeft: '1.25rem' }}>
                                <li>Minimum 6 characters</li>
                                <li>New password must match confirmation</li>
                            </ul>
                        </div>

                        <button
                            type="submit"
                            style={{
                                padding: '0.625rem 1.25rem',
                                background: '#3b82f6',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '0.875rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                        >
                            <Key size={16} /> Change Password
                        </button>
                    </form>
                </section>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}
                >
                    <LogOut size={18} /> Logout
                </button>
            </div>
        </div>
    );
};

export default Account;
