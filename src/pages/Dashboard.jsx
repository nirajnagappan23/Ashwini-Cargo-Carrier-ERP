import React from 'react';
import { Truck, Package, CheckCircle, MapPin, ChevronRight, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { enquiries } = useApp();
    const userName = "Ashwini Client";

    // Calculate Stats
    const confirmedOrders = enquiries.filter(e => e.status === 'Confirmed');

    const activeTrips = confirmedOrders.filter(e =>
        e.tripStatus && !['Delivered', 'Closed'].includes(e.tripStatus)
    );

    const completedTrips = confirmedOrders.filter(e =>
        e.tripStatus && ['Delivered', 'Closed'].includes(e.tripStatus)
    );

    const totalOutstanding = confirmedOrders.reduce((sum, order) => sum + (order.balance || 0), 0);

    // Helper to get current location
    const getCurrentLocation = (order) => {
        if (!order.trackingHistory || order.trackingHistory.length === 0) return 'Not Started';
        const validSteps = order.trackingHistory.filter(step => step.completed && step.location && step.location !== '-');
        if (validSteps.length > 0) {
            return validSteps[validSteps.length - 1].location;
        }
        return 'In Transit';
    };

    // Helper for Status Badge - matching Admin Panel style
    const getStatusBadge = (status) => {
        if (!status) return { bg: '#f1f5f9', text: '#475569', label: status };
        if (status.includes('Delivered') || status.includes('Closed')) return { bg: '#d1fae5', text: '#065f46', label: status };
        if (status.includes('Transit')) return { bg: '#dbeafe', text: '#1e40af', label: status };
        if (status.includes('Loading')) return { bg: '#fef3c7', text: '#92400e', label: status };
        if (status.includes('Despatched') || status.includes('Dispatched')) return { bg: '#e9d5ff', text: '#6b21a8', label: status };
        if (status.includes('Unloading')) return { bg: '#fed7aa', text: '#9a3412', label: status };
        if (status.includes('Pod')) return { bg: '#ccfbf1', text: '#115e59', label: status };
        return { bg: '#f1f5f9', text: '#475569', label: status };
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            {/* Header - Admin Style */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                    Welcome back, {userName}
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                    Here is an overview of your logistics operations.
                </p>
            </div>

            {/* Stats Cards - Admin Panel Style with borders and shadows */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {/* Card 1: Total Orders */}
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '0.5rem' }}>
                            Total Orders
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white' }}>
                            {confirmedOrders.length}
                        </div>
                    </div>
                    <Package style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.2, color: 'white' }} size={56} />
                </div>

                {/* Card 2: Active Trips */}
                <div style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '0.5rem' }}>
                            Active Trips
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white' }}>
                            {activeTrips.length}
                        </div>
                    </div>
                    <Truck style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.2, color: 'white' }} size={56} />
                </div>

                {/* Card 3: Pending Payments */}
                <div style={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '0.5rem' }}>
                            Pending Payments
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white' }}>
                            ₹{(totalOutstanding / 1000).toFixed(0)}K
                        </div>
                    </div>
                    <DollarSign style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.2, color: 'white' }} size={56} />
                </div>

                {/* Card 4: Completed Trips */}
                <div style={{
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '0.5rem' }}>
                            Completed Trips
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white' }}>
                            {completedTrips.length}
                        </div>
                    </div>
                    <CheckCircle style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.2, color: 'white' }} size={56} />
                </div>
            </div>

            {/* Active Trips Table - Admin Panel Card Style */}
            <div style={{
                background: '#ffffff',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
            }}>
                {/* Table Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f8fafc'
                }}>
                    <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Truck size={20} style={{ color: '#3b82f6' }} /> Live Shipments
                    </h3>
                    <button
                        onClick={() => navigate('/trips')}
                        style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#3b82f6',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}
                    >
                        View All <ChevronRight size={14} />
                    </button>
                </div>

                {/* Table Content */}
                <div style={{ overflowX: 'auto' }}>
                    {activeTrips.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                            No active trips at the moment.
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LR No</th>
                                    <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consignee</th>
                                    <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Route</th>
                                    <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                    <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Location</th>
                                    <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeTrips.map((trip, index) => {
                                    const consigneeName = trip.consignee?.name || trip.consignee?.companyName || (trip.drops && trip.drops[0]?.companyName) || 'Unknown';
                                    const statusBadge = getStatusBadge(trip.tripStatus);
                                    const currentLocation = getCurrentLocation(trip);

                                    // Display LR / Order format
                                    const lrNumber = trip.lrNumber || '—';
                                    const orderNumber = trip.orderNumber || '—';

                                    return (
                                        <tr key={trip.id} style={{
                                            borderBottom: index < activeTrips.length - 1 ? '1px solid #f1f5f9' : 'none',
                                            transition: 'background-color 0.15s'
                                        }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                {/* LR Number - Primary */}
                                                <div style={{ fontWeight: '700', color: '#1e40af', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                                                    {lrNumber}
                                                </div>
                                                {/* Order Number - Secondary */}
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                                                    {orderNumber}
                                                </div>
                                                {/* Enquiry Reference - Tertiary */}
                                                {trip.enquiryNumber && (
                                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.125rem' }}>
                                                        {trip.enquiryNumber}
                                                    </div>
                                                )}
                                            </td>

                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ fontWeight: '500', fontSize: '0.875rem', color: '#0f172a' }}>
                                                    {consigneeName}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#475569' }}>
                                                    <MapPin size={14} style={{ color: '#94a3b8' }} />
                                                    {trip.route}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    background: statusBadge.bg,
                                                    color: statusBadge.text
                                                }}>
                                                    {statusBadge.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                                                    {currentLocation}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <button
                                                    onClick={() => alert("Tracking feature is coming soon!")}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '0.5rem',
                                                        fontSize: '0.875rem',
                                                        fontWeight: '500',
                                                        background: 'transparent',
                                                        border: '1px solid #e2e8f0',
                                                        color: '#0f172a',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = '#3b82f6';
                                                        e.currentTarget.style.color = '#3b82f6';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                                        e.currentTarget.style.color = '#0f172a';
                                                    }}
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
