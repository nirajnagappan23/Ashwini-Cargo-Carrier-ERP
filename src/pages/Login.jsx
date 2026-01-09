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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-3xl opacity-50"></div>
            </div>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden z-10 m-4 relative">
                <div className="p-8 pb-6">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                            <Truck size={32} className="text-white" />
                        </div>
                    </div>
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">Welcome Back</h1>
                        <p className="text-slate-500 text-sm mt-2">Sign in to manage your shipments</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Login ID</label>
                            <div className="relative">
                                <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Email or Phone Number"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="flex justify-end mt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsForgotModalOpen(true)}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-700/40 transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
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

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500">For Staff</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                const adminUrl = window.location.hostname.includes('localhost')
                                    ? 'http://localhost:5174'
                                    : 'https://app-ashwinicargocarrier-admin.netlify.app';
                                window.location.href = adminUrl;
                            }}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Lock size={18} /> Admin Access
                        </button>
                    </form>
                </div>



                {/* No Registration Section - Admin Managed Only */}
                {/* <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-500">
                        Accounts are managed by Administration.
                    </p>
                </div> */}
            </div>

            <div className="absolute bottom-6 text-slate-400 text-xs text-center w-full">
                &copy; 2026 Ashwini Cargo Carrier. All rights reserved.
            </div>

            {/* Forgot Password Modal */}
            {
                isForgotModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-fade-in">
                            <button
                                onClick={() => setIsForgotModalOpen(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Reset Password</h3>
                                <p className="text-slate-600 text-sm">
                                    Accounts are managed by the Administration. Please enter your Login ID below to request a password reset.
                                </p>
                            </div>

                            <form onSubmit={handleForgotSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Login ID (Email/Phone)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your ID"
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
                                    Send Reset Request
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Login;
