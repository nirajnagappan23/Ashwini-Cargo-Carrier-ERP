import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { Package, TrendingUp, DollarSign, Users, Clock, CheckCircle, Truck, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { orders, clients } = useAdmin();
    const navigate = useNavigate();

    // Calculate stats
    const stats = {
        totalOrders: orders.length,
        activeTrips: orders.filter(o => o.tripStatus && !['Delivered', 'Closed'].includes(o.tripStatus)).length,
        totalRevenue: orders.reduce((sum, o) => sum + (o.totalFreight || 0), 0),
        pendingPayments: orders.reduce((sum, o) => sum + (o.balance || 0), 0),
        totalClients: clients.length
    };

    // Get active shipments (not delivered/closed)
    const liveShipments = orders
        .filter(o => o.tripStatus && !['Delivered', 'Closed'].includes(o.tripStatus))
        .slice(0, 10);

    // Helper to get current location from tracking history
    const getCurrentLocation = (order) => {
        if (!order.trackingHistory || order.trackingHistory.length === 0) return 'Not Started';
        const validSteps = order.trackingHistory.filter(step => step.completed && step.location && step.location !== '-');
        if (validSteps.length > 0) {
            return validSteps[validSteps.length - 1].location;
        }
        return 'In Transit';
    };

    const getStatusColor = (status) => {
        if (!status) return 'badge-info';
        if (status.includes('Delivered') || status.includes('Closed')) return 'badge-success';
        if (status.includes('Transit')) return 'badge-info';
        if (status.includes('Loading')) return 'badge-warning';
        if (status.includes('Despatched') || status.includes('Dispatched')) return 'badge-info';
        if (status.includes('Unloading')) return 'badge-warning';
        if (status.includes('Pod')) return 'badge-success';
        return 'badge-info';
    };

    return (
        <div>
            <div className="admin-header">
                <h1>Dashboard</h1>
                <p>Welcome to Ashwini Cargo Carrier Admin Panel</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="admin-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Orders</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.totalOrders}</div>
                        </div>
                        <Package size={32} style={{ opacity: 0.8 }} />
                    </div>
                </div>

                <div className="admin-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Active Trips</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.activeTrips}</div>
                        </div>
                        <TrendingUp size={32} style={{ opacity: 0.8 }} />
                    </div>
                </div>

                <div className="admin-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Revenue</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>₹{(stats.totalRevenue / 1000).toFixed(0)}K</div>
                        </div>
                        <DollarSign size={32} style={{ opacity: 0.8 }} />
                    </div>
                </div>

                <div className="admin-card" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Pending Payments</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>₹{(stats.pendingPayments / 1000).toFixed(0)}K</div>
                        </div>
                        <Clock size={32} style={{ opacity: 0.8 }} />
                    </div>
                </div>
            </div>

            {/* Live Shipments Table */}
            <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Truck size={20} style={{ color: 'var(--admin-primary)' }} /> Live Shipments
                    </h2>
                    <button className="admin-btn admin-btn-outline" onClick={() => navigate('/trips')}>
                        View All
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    {liveShipments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-light)' }}>
                            No active shipments at the moment.
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--admin-border)', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LR No</th>
                                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consignor</th>
                                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consignee</th>
                                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Route</th>
                                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Location</th>
                                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {liveShipments.map(order => {
                                    const consignorName = order.consignor?.name || order.pickups?.[0]?.companyName || 'N/A';
                                    const consigneeName = order.consignee?.name || order.consignee?.companyName || order.drops?.[0]?.companyName || order.consignments?.[0]?.consignee || 'N/A';
                                    const currentLocation = getCurrentLocation(order);

                                    // Display LR / Order format
                                    const lrNumber = order.lrNumber || '—';
                                    const orderNumber = order.orderNumber || '—';

                                    return (
                                        <tr key={order.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                            <td style={{ padding: '1rem 0.75rem' }}>
                                                {/* LR Number - Primary */}
                                                <div style={{ fontWeight: '700', color: 'var(--admin-primary)', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                                                    {lrNumber}
                                                </div>
                                                {/* Order Number - Secondary */}
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                                                    {orderNumber}
                                                </div>
                                                {/* Enquiry Reference - Tertiary */}
                                                {order.enquiryNumber && (
                                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.125rem' }}>
                                                        {order.enquiryNumber}
                                                    </div>
                                                )}
                                            </td>

                                            <td style={{ padding: '1rem 0.75rem' }}>
                                                <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{consignorName}</div>
                                            </td>
                                            <td style={{ padding: '1rem 0.75rem' }}>
                                                <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{consigneeName}</div>
                                            </td>
                                            <td style={{ padding: '1rem 0.75rem' }}>
                                                <div style={{ fontSize: '0.875rem' }}>{order.route}</div>
                                            </td>
                                            <td style={{ padding: '1rem 0.75rem' }}>
                                                <span className={`admin-badge ${getStatusColor(order.tripStatus)}`}>
                                                    {order.tripStatus}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 0.75rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--admin-text)' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                                                    {currentLocation}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 0.75rem' }}>
                                                <button
                                                    className="admin-btn admin-btn-outline"
                                                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                                                    onClick={() => navigate(`/trip/${order.id}`)}
                                                >
                                                    Track
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
