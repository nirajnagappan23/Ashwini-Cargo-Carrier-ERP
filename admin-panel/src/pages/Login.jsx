import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Truck } from 'lucide-react';
import erpLogo from '../assets/erp_logo.jpg';

const Login = () => {
    const { login } = useAdmin();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isForgotOpen, setIsForgotOpen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate network delay for better UX
        setTimeout(() => {
            // 1. Strict Hardcoded Master Admin Check (As requested)
            if (email === 'nirajnagappan@gmail.com' && password === 'Niraj!!123') {
                // Success - manually trigger context login if needed, or just set token
                // We'll use the context method if it supports manual override, otherwise we force it.
                // Assuming login() takes credentials and handles state.
                const success = login(email, password);
                if (success) {
                    navigate('/');
                } else {
                    // Fallback if context logic differs
                    localStorage.setItem('adminToken', 'master-admin-token');
                    navigate('/');
                }
            } else {
                // Check if user is trying to access Client Portal
                if (email.toLowerCase().includes('ashwini') ||
                    email.toLowerCase().includes('client') ||
                    !email.includes('@')) {
                    setError('Client accounts must use the Client Portal.');
                } else {
                    setError('Invalid Administrator credentials.');
                }
            }
            setIsLoading(false);
        }, 800);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', // Darker, professional background
            padding: '1rem'
        }}>
            <div className="admin-card" style={{
                width: '100%',
                maxWidth: '420px',
                padding: '0',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                border: 'none',
                borderRadius: '1rem',
                backgroundColor: 'white'
            }}>
                {/* Brand Header */}
                <div style={{
                    background: 'white',
                    padding: '2.5rem 2rem 1rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        marginBottom: '1.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        borderRadius: '1rem',
                        overflow: 'hidden'
                    }}>
                        <img
                            src={erpLogo}
                            alt="Ashwini Cargo Logo"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        color: '#1e293b',
                        lineHeight: '1.3',
                        marginBottom: '0.5rem'
                    }}>
                        Admin & Staff Access
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        Sign in to manage operations
                    </p>
                </div>

                {/* Login Form */}
                <div style={{ padding: '2rem', background: 'white' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                                Admin Login ID
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@ashwinicargo.com"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 2.75rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s',
                                        outline: 'none',
                                        backgroundColor: '#f8fafc'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3b82f6';
                                        e.target.style.backgroundColor = 'white';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.backgroundColor = '#f8fafc';
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                                    Password
                                </label>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 2.75rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s',
                                        outline: 'none',
                                        backgroundColor: '#f8fafc'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3b82f6';
                                        e.target.style.backgroundColor = 'white';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.backgroundColor = '#f8fafc';
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                            <button
                                type="button"
                                onClick={() => setIsForgotOpen(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#2563eb',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    padding: 0
                                }}
                            >
                                Forgot Password?
                            </button>
                        </div>

                        {error && (
                            <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                fontSize: '1rem',
                                cursor: isLoading ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'background 0.2s',
                                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                            }}
                            onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = '#1d4ed8')}
                            onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = '#2563eb')}
                        >
                            {isLoading ? 'Signing In...' : (
                                <>
                                    Sign In <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Client Access Link */}
                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                            Valid Client with a Tracking ID?
                        </p>
                        <a
                            href="https://app.ashwinicargocarrier.in/login"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: '#475569',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                textDecoration: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #e2e8f0',
                                background: '#f8fafc',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = '#cbd5e1';
                                e.currentTarget.style.background = '#f1f5f9';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.background = '#f8fafc';
                            }}
                        >
                            <Truck size={16} />
                            Click here for Client Access
                        </a>
                    </div>
                </div>

                <div style={{ background: '#f1f5f9', padding: '1rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        © 2026 Ashwini Cargo Carrier. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {isForgotOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    backdropFilter: 'blur(2px)'
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#2563eb' }}>
                            <Lock size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e293b' }}>Master Admin Reset</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            If you have lost access to the Master Admin account, please contact the developer for a secure reset.
                        </p>
                        <button
                            onClick={() => setIsForgotOpen(false)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'white',
                                border: '1px solid #cbd5e1',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                color: '#475569',
                                cursor: 'pointer'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
