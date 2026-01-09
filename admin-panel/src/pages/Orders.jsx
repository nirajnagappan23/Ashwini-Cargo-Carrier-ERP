import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Search, Filter, Plus, MapPin, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
    const { orders } = useAdmin();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [clientFilter, setClientFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Get unique clients for filter dropdown
    const uniqueClients = [...new Set(orders.map(o => o.clientName).filter(Boolean))].sort();

    const filteredOrders = orders.filter(order => {
        const term = searchTerm.toLowerCase();
        const matchesTerm = !searchTerm ||
            order.orderId?.toLowerCase().includes(term) ||
            order.clientRef?.toLowerCase().includes(term) ||
            order.lrNumber?.toLowerCase().includes(term) || // Check top-level LR
            order.vehicleNo?.toLowerCase().includes(term) ||
            order.driverPhone?.includes(term) ||
            order.consignments?.some(c =>
                c.lrNumber?.toLowerCase().includes(term) ||
                c.consignee?.toLowerCase().includes(term) ||
                c.consigneePhone?.includes(term)
            ) ||
            order.consignor?.name?.toLowerCase().includes(term);

        const matchesClient = !clientFilter || order.clientName === clientFilter;
        const matchesStatus = statusFilter === 'All' || order.tripStatus === statusFilter;

        return matchesTerm && matchesClient && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'badge-success';
            case 'In Transit': case 'Partially Delivered': return 'badge-info';
            case 'Loading': return 'badge-warning';
            default: return 'badge-info';
        }
    };

    return (
        <div>
            <div className="admin-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Trips Management</h1>
                        <p>Manage all customer trips and shipments</p>
                    </div>
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => navigate('/book-trip')}
                    >
                        <Plus size={16} /> Book New Trip
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                    {/* Unified Search */}
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-light)' }} />
                        <input
                            className="admin-input pl-10"
                            placeholder="Search Orders, LR, Vehicle, Consignee..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                paddingLeft: '2.5rem',
                                paddingRight: '0.75rem',
                                paddingTop: '0.625rem',
                                paddingBottom: '0.625rem',
                                border: '1px solid var(--admin-border)',
                                borderRadius: '0.5rem'
                            }}
                        />
                    </div>

                    {/* Client Filter */}
                    <select
                        value={clientFilter}
                        onChange={(e) => setClientFilter(e.target.value)}
                        style={{
                            padding: '0.625rem 2rem 0.625rem 0.75rem',
                            border: '1px solid var(--admin-border)',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        <option value="">All Clients</option>
                        {uniqueClients.map(client => (
                            <option key={client} value={client}>{client}</option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '0.625rem 2rem 0.625rem 0.75rem',
                            border: '1px solid var(--admin-border)',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        <option value="All">All Status</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Partially Delivered">Partially Delivered</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Loading">Loading</option>
                    </select>
                </div>
            </div >

            {/* Orders Grid */}
            < div style={{ display: 'grid', gap: '1rem' }}>
                {
                    filteredOrders.map(order => (
                        <div
                            key={order.id}
                            className="admin-card"
                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            onClick={() => navigate(`/trip/${order.id}`)}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div>
                                    {/* LR Number - Primary */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--admin-primary)', fontFamily: 'monospace', display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                                            <span>{(order.lrNumber || order.consignments?.[0]?.lrNumber) ? `LR: ${order.lrNumber || order.consignments?.[0]?.lrNumber}` : '—'}</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '500', opacity: 0.9 }}>{order.orderDate}</span>
                                        </h3>
                                        <span className={`admin-badge ${getStatusColor(order.tripStatus)}`}>
                                            {order.tripStatus}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const url = `http://localhost:5173/track/${order.id}`;
                                                navigator.clipboard.writeText(url);
                                                alert('Tracking URL Copied: ' + url);
                                            }}
                                            style={{
                                                marginLeft: '0.75rem',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.375rem',
                                                border: '1px solid #e2e8f0',
                                                background: 'white',
                                                color: '#64748b',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.borderColor = '#3b82f6'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                        >
                                            <Share2 size={14} /> Share
                                        </button>
                                    </div>

                                    {/* Order Number - Secondary */}
                                    <div style={{ fontSize: '0.875rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '0.25rem' }}>
                                        {order.orderNumber || order.orderId || '—'}
                                    </div>

                                    {/* Enquiry Number - Tertiary */}
                                    {order.enquiryNumber && (
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace', marginBottom: '0.25rem' }}>
                                            From {order.enquiryNumber}
                                        </div>
                                    )}

                                    {/* Client & Date */}
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginTop: '0.5rem' }}>
                                        {order.clientName}
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>
                                        Total Freight
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--admin-text)' }}>
                                        ₹{order.totalFreight?.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--admin-border)' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Client</div>
                                    <div style={{ fontWeight: '500' }}>{order.clientName}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Route</div>
                                    <div style={{ fontWeight: '500' }}>{order.route}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Truck</div>
                                    <div style={{ fontWeight: '500' }}>{order.vehicleNo || 'Not Assigned'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>Driver: {order.driverPhone || '-'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Consignee</div>
                                    <div style={{ fontWeight: '500' }}>{order.consignments?.[0]?.consignee || '-'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>{order.consignments?.[0]?.consigneePhone || '-'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Material</div>
                                    <div style={{ fontWeight: '500' }}>{order.materials?.[0]?.type || 'Standard'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Current Location</div>
                                    <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <MapPin size={14} style={{ color: 'var(--admin-primary)' }} />
                                        {[...(order.trackingHistory || [])].reverse().find(h => h.completed && h.location && h.location !== '-')?.location || 'Origin'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Payment</div>
                                    <div style={{
                                        fontWeight: '700',
                                        color: (order.paymentBy === 'Consignee' || order.paymentMode === 'To Pay') ? '#c2410c' : '#15803d',
                                        fontSize: '0.75rem',
                                        background: (order.paymentBy === 'Consignee' || order.paymentMode === 'To Pay') ? '#ffedd5' : '#dcfce7',
                                        padding: '0.125rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        display: 'inline-block'
                                    }}>
                                        {(order.paymentBy === 'Consignee' || order.paymentMode === 'To Pay') ? 'TO PAY' : 'PAID'}
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))
                }

                {
                    filteredOrders.length === 0 && (
                        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: 'var(--admin-text-light)' }}>No orders found matching your criteria.</p>
                        </div>
                    )
                }
            </div >
        </div >
    );
};

export default Orders;
