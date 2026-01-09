import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Truck,
    MessageSquare,
    User,
    FileText,
    Map as MapIcon,
    LogOut,
    Menu,
    X,
    CreditCard
} from 'lucide-react';
import './Layout.css';

import erpLogo from '../assets/erp_logo.jpg';

const Layout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState('Valued Client Co.');
    const [userName, setUserName] = useState('Client User');

    useEffect(() => {
        const storedCompany = localStorage.getItem('clientName') || localStorage.getItem('clientCompanyName');
        const storedUser = localStorage.getItem('clientDisplayName');

        if (storedCompany) setCompanyName(storedCompany);
        if (storedUser) setUserName(storedUser);
    }, []);

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/book', label: 'Book Truck', icon: Truck },
        { path: '/trips', label: 'Trips/Orders', icon: MapIcon },
        { path: '/chat', label: 'Chat', icon: MessageSquare },

        // { path: '/tracking', label: 'Tracking', icon: MapIcon }, // Included in Trips usually or separate module? Request said "Tracking Module". User provided "Tracking view".
        { path: '/account', label: 'Account', icon: User },
    ];

    // For bottom nav on mobile, we might want fewer items or all of them.
    // The request specifically listed for mobile nav: "Book, Trips, Chat, Account". 
    // Dashboard might be the home.

    const mobileNavItems = [
        { path: '/', label: 'Home', icon: LayoutDashboard },
        { path: '/book', label: 'Book', icon: Truck },
        { path: '/trips', label: 'Trips/Orders', icon: MapIcon },
        { path: '/chat', label: 'Chat', icon: MessageSquare },
        { path: '/account', label: 'Account', icon: User },
    ];

    return (
        <div className="app-container">
            {/* Sidebar - Desktop */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <img src={erpLogo} alt="Logo" style={{ height: '54px', width: 'auto', borderRadius: '4px', marginRight: '12px' }} />
                        <div>
                            <div className="logo-text">
                                <span className="text-brand-blue">ASHWINI</span> <span className="text-brand-red">CARGO CARRIER</span>
                            </div>
                            <div className="logo-subtitle">Client Panel</div>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button
                        className="nav-item logout-btn"
                        onClick={() => {
                            if (window.confirm('Are you sure you want to logout?')) {
                                localStorage.removeItem('isLoggedIn');
                                localStorage.removeItem('userRole');
                                window.location.href = '/login';
                            }
                        }}
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                {/* Desktop Header containing User Profile */}
                <header className="desktop-header">
                    <div
                        onClick={() => navigate('/account')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            transition: 'background 0.2s'
                        }}
                        title="Go to Account Settings"
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>{companyName}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>{userName}</div>
                        </div>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '1.25rem',
                            boxShadow: '0 2px 5px rgba(59, 130, 246, 0.3)'
                        }}>
                            {userName.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* Mobile Header */}
                <header className="mobile-header">
                    <div className="logo">
                        <img src={erpLogo} alt="Logo" style={{ height: '44px', width: 'auto', borderRadius: '4px', marginRight: '8px' }} />
                        <div>
                            <div className="logo-text" style={{ fontSize: '1.25rem' }}>
                                <span className="text-brand-blue">ASHWINI</span> <span className="text-brand-red">CARGO CARRIER</span>
                            </div>
                            <div className="logo-subtitle">Client Panel</div>
                        </div>
                    </div>
                    {/* <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button> */}
                    {/* We use bottom nav, so maybe just simple header */}
                </header>

                <div className="content-scrollable">
                    <Outlet />
                </div>
            </main>

            {/* Bottom Navigation - Mobile */}
            <nav className="bottom-nav">
                {mobileNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={24} />
                        <span className="bottom-nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Layout;
