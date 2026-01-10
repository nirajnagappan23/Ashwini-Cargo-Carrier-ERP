import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Building2 } from 'lucide-react';
import erpLogo from '../assets/erp_logo.jpg';
import { supabase } from '../supabase';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isForgotOpen, setIsForgotOpen] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // 1. Check strict hardcoded Admin credentials (Anti-Pattern but requested safety check)
            if (email.toLowerCase().trim() === 'nirajnagappan@gmail.com') {
                // If user tries to login as Master Admin on CLIENT app, guide them to Admin Panel
                setError('Admin account detected. Please use the Admin Panel link below.');
                setIsLoading(false);
                return;
            }

            // 2. Client Authentication Logic (Supabase)
            // Query the 'clients' table or 'users' table where role is client
            // For now, we'll keep the existing logic: Check 'users' table first

            // Check 'users' table (Staff/Admin/Client potentially)
            const { data: user, error: dbError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (dbError && dbError.code !== 'PGRST116') {
                throw dbError;
            }

            if (user) {
                // If it's a staff/admin user, block them
                if (user.role === 'admin' || user.role === 'staff') {
                    setError('Staff/Admin accounts must use the Admin Panel.');
                    setIsLoading(false);
                    return;
                }

                // Verify password (simple check for now as per previous implementation)
                if (user.password === password) {
                    localStorage.setItem('userRole', 'client');
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('clientName', user.company_name || user.name);
                    navigate('/');
                    return;
                } else {
                    setError('Invalid password.');
                    setIsLoading(false);
                    return;
                }
            }

            // 3. Fallback / Client Mock Logic (Preserving previous mock logic if DB fails or for demo)
            // Client Mock Authentication
            let companyName = "Valued Client Co.";
            let displayName = "Client User";
            let isValidMock = false;

            if (email.toLowerCase().includes('ashwini')) {
                companyName = "Ashwini Steel Works";
                displayName = "Ramesh Kumar";
                isValidMock = true;
            } else if (email.toLowerCase().includes('ta')) {
                companyName = "Tata Motors";
                displayName = "Suresh Operations";
                isValidMock = true;
            } else if (email.toLowerCase().includes('demo')) {
                companyName = "Demo Client Ltd";
                isValidMock = true;
            }

            if (isValidMock) {
                localStorage.setItem('userRole', 'client');
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('clientName', companyName);
                localStorage.setItem('clientCompanyName', companyName);
                localStorage.setItem('clientDisplayName', displayName);
                navigate('/');
                return;
            }

            setError('Invalid credentials or account not found.');

        } catch (err) {
            console.error("Login Error:", err);
            setError('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            padding: '1rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                padding: '0',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
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
                        Client Portal Access
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        Sign in to track your consignments
                    </p>
                </div>

                {/* Login Form */}
                <div style={{ padding: '2rem', background: 'white' }}>
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                                Client Login ID
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="client@company.com"
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
                            {isLoading ? 'Verifying...' : (
                                <>
                                    Sign In <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Admin Access Link */}
                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                            Are you a Staff Member or Administrator?
                        </p>
                        <a
                            href="https://admin.ashwinicargocarrier.in/login"
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
                            <Building2 size={16} />
                            Click here for Admin Access
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
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e293b' }}>Account Recovery</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            For security, client access is managed by the Administrator. Please contact support.
                        </p>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Support Contact</div>
                            <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '1rem' }}>+91 99446 73442</div>
                        </div>
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
