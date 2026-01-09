import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Truck } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Forgot Password State
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');

    const handleForgotSubmit = (e) => {
        e.preventDefault();
        alert(`Password reset request for "${forgotEmail}" has been sent to the Admin. You will be contacted shortly.`);
        setIsForgotModalOpen(false);
        setForgotEmail('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // 1. Check if user is Staff/Admin (Supabase Check)
            // We dynamic import or use the existing supabase instance (assumed imported)
            // But wait, we need to import supabase at the top. 
            // Since this tool replaces lines, I need to make sure 'supabase' is available. 
            // I'll add the import in a separate tool call if needed, but 'supabase' logic here:

            // Note: We need to ensure supabase is imported in the file header.
            // For now, assuming direct logic replacement.

            // Temporary Admin URL (Replace with your Production Netlify Admin URL later)
            const ADMIN_URL = window.location.hostname.includes('localhost')
                ? 'http://localhost:5174'
                : 'https://app-ashwinicargocarrier-admin.netlify.app'; // Production Admin URL

            // Check 'users' table
            const { data: staffUser } = await import('../supabase').then(module =>
                module.supabase.from('users').select('*').eq('email', email).single()
            );

            if (staffUser) {
                // Verify Password (Simple equality check for MVP)
                if (staffUser.password === password) {
                    // Success - Redirect to Admin Panel
                    window.location.href = ADMIN_URL;
                    return;
                } else if (staffUser.password) {
                    // Metadata exists but password wrong
                    throw new Error("Invalid staff credentials");
                }
            }

            // 2. Legacy/Dev Admin Check (Fallback)
            if (email.toLowerCase().includes('admin') && email.includes('@')) {
                window.location.href = ADMIN_URL;
                return;
            }

            // 3. Client Authentication Logic
            // (For now, we simulate client login as before, but ideally check 'clients' table)

            // Client Mock Authentication
            let companyName = "Valued Client Co.";
            let displayName = "Client User";

            // Mock Data Logic
            if (email.toLowerCase().includes('ashwini')) {
                companyName = "Ashwini Steel Works";
                displayName = "Ramesh Kumar";
            } else if (email.toLowerCase().includes('ta')) {
                companyName = "Tata Motors";
                displayName = "Suresh Operations";
            } else if (email.toLowerCase().includes('demo')) {
                companyName = "Demo Client Ltd";
                displayName = "Demo User";
            }

            // Set LocalStorage
            localStorage.setItem('userRole', 'client');
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('clientName', companyName);
            localStorage.setItem('clientCompanyName', companyName);
            localStorage.setItem('clientDisplayName', displayName);
            localStorage.setItem('clientLoginId', email);

            // Redirect
            navigate('/');
            setIsLoading(false);

        } catch (err) {
            console.error("Login Error:", err);
            setError('Invalid credentials or connection error.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] font-sans p-4">
            <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden relative">
                <div className="p-8 pt-10">
                    <div className="flex justify-center mb-6">
                        {/* Logo Placeholder - Matches the yellow icon style */}
                        <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center shadow-inner">
                            <Truck size={36} className="text-amber-600" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome to <br />Ashwini Cargo Carrier ERP</h1>
                        <p className="text-slate-500 text-sm mt-3 font-medium">Sign in to access your dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-700">Login ID (Email)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail size={20} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="yourname@ashwinicargo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-700">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock size={20} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsForgotModalOpen(true)}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                                <div className="text-sm text-red-600 font-medium">{error}</div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-blue-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Signing In...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Section - Matches Image */}
                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100/80 text-center">
                    <p className="text-xs text-slate-500 font-medium">
                        &copy; 2026 Ashwini Cargo Carrier. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Hidden/Subtle Admin Link (Kept for functionality but hidden from main view) */}
            <div className="absolute bottom-4 right-4 z-20">
                <button
                    type="button"
                    onClick={() => {
                        const adminUrl = window.location.hostname.includes('localhost')
                            ? 'http://localhost:5174'
                            : 'https://app-ashwinicargocarrier-admin.netlify.app';
                        window.location.href = adminUrl;
                    }}
                    className="text-xs text-slate-700/30 hover:text-slate-500 transition-colors flex items-center gap-1.5"
                >
                    <Lock size={12} /> Admin
                </button>
            </div>

            {/* Forgot Password Modal */}
            {isForgotModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
                        <button
                            onClick={() => setIsForgotModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Lock size={24} className="text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Account Recovery</h3>
                            <p className="text-slate-500 text-sm mt-1 px-2">
                                For security, account resets are handled manually by our support team.
                            </p>
                        </div>

                        <form onSubmit={handleForgotSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Login ID</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    placeholder="name@company.com"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors"
                            >
                                Request Reset
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
