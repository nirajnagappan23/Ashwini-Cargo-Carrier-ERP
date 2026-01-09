import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    CreditCard,
    FileText,
    Users,
    LogOut,
    Truck,
    MessageSquare,
    MessageCircle,
    Database,
    Monitor
} from 'lucide-react';
import './Layout.css';

import erpLogo from '../assets/erp_logo.jpg';

import { useAdmin } from '../context/AdminContext';

const Layout = () => {
    const { logout, getCurrentUser } = useAdmin();
    const user = getCurrentUser();
    const isManager = user?.role === 'Manager';

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/enquiries', label: 'Enquiries', icon: MessageSquare },
        { path: '/trips', label: 'Trips/Orders', icon: Package },
        { path: '/chats', label: 'Chats', icon: MessageCircle },
        // Payments and Documents moved to inside Trip Details
        { path: '/clients', label: 'Clients', icon: Users },
        { path: '/brokers', label: 'Brokers', icon: Truck },
    ];

    const systemNavItems = [
        { path: '/master-record', label: 'Master Record', icon: Database, restricted: true }, // Restricted for Managers
        { path: '/client-dashboard', label: 'Client Dashboard', icon: Monitor },
        { path: '/users', label: 'Users', icon: Users, restricted: true }, // Restricted for Managers
    ];

    const filteredSystemNav = systemNavItems.filter(item => {
        if (item.restricted && isManager) return false;
        return true;
    });

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <div className="admin-logo">
                        <img src={erpLogo} alt="Logo" style={{ height: '54px', width: 'auto', borderRadius: '4px', marginRight: '12px' }} />
                        <div>
                            <div className="logo-text">
                                <span className="text-brand-blue">ASHWINI</span> <span className="text-brand-red">CARGO CARRIER</span>
                            </div>
                            <div className="logo-subtitle">Admin Panel</div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '0 1.25rem', marginBottom: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: '#e2e8f0', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{user?.name || 'Guest'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user?.role || 'Staff'}</div>
                    </div>
                </div>

                <nav className="admin-sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}

                    {/* Separator */}
                    <div style={{ margin: '1rem 0 0.5rem', borderTop: '1px solid #e2e8f0' }}></div>
                    <div style={{ padding: '0 1.25rem', marginBottom: '0.5rem', fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        System
                    </div>

                    {filteredSystemNav.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `admin-nav-item system-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <button className="admin-nav-item logout-btn" onClick={logout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
