import React, { useState } from 'react';
import { MapPin, Calendar, Truck, FileText, Hash, Info, ChevronRight, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Trips = () => {
    const { enquiries } = useApp();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('ongoing');
    const [searchTerm, setSearchTerm] = useState('');

    const tabs = [
        { id: 'ongoing', label: 'Ongoing' },
        { id: 'delivered', label: 'Delivered' },
        { id: 'pod', label: 'POD' },
        { id: 'closed', label: 'Closed' },
    ];

    const getTabForStatus = (status) => {
        if (!status) return 'ongoing';
        const s = status.toLowerCase();
        if (s.includes('closed')) return 'closed';
        if (s.includes('pod')) return 'pod';
        if (s.includes('delivered')) return 'delivered';
        return 'ongoing'; // Default for In Transit, Loading, Confirmed, etc.
    };

    // Convert Confirmed Enquiries to Trips for Display
    const trips = enquiries
        .filter(e => e.status === 'Confirmed')
        .map(e => ({
            id: e.id,
            clientRef: e.clientRef,
            orderId: e.orderId,
            orderDate: e.orderDate,
            lrNumber: e.lrNumber,
            lrDate: e.lrDate,
            from: e.route.split(' -> ')[0],
            to: e.route.split(' -> ')[1],
            route: e.route,
            truck: e.requestedTrucks?.[0] || 'Unassigned',
            material: e.materials?.[0]?.type || 'Standard',
            weight: e.materials?.[0]?.weight ? `${e.materials[0].weight} ${e.materials[0].weightUnit}` : '-',
            status: e.tripStatus || 'On Route',
            amount: e.quoteAmount ? `₹ ${e.quoteAmount.toLocaleString()}` : '-',
            consignee: e.consignments?.[0]?.consignee || e.drops?.[0]?.companyName || 'Multipoint / Unknown',
            consigneePhone: e.consignments?.[0]?.consigneePhone || e.consignor?.phone || '-',
            type: getTabForStatus(e.tripStatus),
            paymentMode: e.paymentMode,
            consignor: e.consignor,
            enquiryNumber: e.enquiryNumber,
            orderNumber: e.orderNumber,
            driverPhone: e.driverPhone,
            vehicleNo: e.vehicleNo,
            currentLocation: [...(e.trackingHistory || [])].reverse().find(h => h.completed && h.location && h.location !== '-')?.location || 'Origin'
        }));

    const filteredTrips = trips.filter(t => {
        const matchesTab = t.type === activeTab || (activeTab === 'ongoing' && t.type === 'ongoing');
        const matchesSearch = !searchTerm ||
            t.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.clientRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.lrNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getStatusBadgeColor = (status) => {
        if (!status) return 'bg-slate-100 text-slate-700';
        if (status.includes('Delivered') || status.includes('Closed')) return 'bg-green-100 text-green-700';
        if (status.includes('Transit')) return 'bg-blue-100 text-blue-700';
        if (status.includes('Loading')) return 'bg-yellow-100 text-yellow-700';
        if (status.includes('Despatched') || status.includes('Dispatched')) return 'bg-purple-100 text-purple-700';
        if (status.includes('Unloading')) return 'bg-orange-100 text-orange-700';
        if (status.includes('Pod')) return 'bg-teal-100 text-teal-700';
        return 'bg-slate-100 text-slate-700';
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            {/* Header - Admin Style */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                    My Trips / Orders
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                    Track and manage your shipments
                </p>
            </div>

            {/* Filters Card - Admin Style */}
            <div style={{
                background: '#ffffff',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                marginBottom: '1.5rem'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            placeholder="Order ID / LR Number..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                paddingLeft: '2.5rem',
                                paddingRight: '0.75rem',
                                paddingTop: '0.625rem',
                                paddingBottom: '0.625rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem'
                            }}
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value)}
                        style={{
                            padding: '0.625rem 2rem 0.625rem 0.75rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                        }}
                    >
                        {tabs.map(tab => (
                            <option key={tab.id} value={tab.id}>{tab.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Orders Grid - Admin Style */}
            <div style={{ display: 'grid', gap: '1rem' }}>
                {filteredTrips.length === 0 ? (
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '0.75rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e2e8f0',
                        padding: '3rem',
                        textAlign: 'center'
                    }}>
                        <p style={{ color: '#94a3b8' }}>No trips found matching your criteria.</p>
                    </div>
                ) : (
                    filteredTrips.map(trip => (
                        <div
                            key={trip.id}
                            onClick={() => navigate(`/trip/${trip.id}`)}
                            style={{
                                background: '#ffffff',
                                borderRadius: '0.75rem',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                border: '1px solid #e2e8f0',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div>
                                    {/* LR Number - Primary */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e40af', fontFamily: 'monospace', display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                                            <span>{trip.lrNumber ? `LR: ${trip.lrNumber}` : '—'}</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '500', opacity: 0.9 }}>{trip.orderDate}</span>
                                        </h3>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }} className={getStatusBadgeColor(trip.status)}>
                                            {trip.status}
                                        </span>
                                    </div>

                                    {/* Order Number - Secondary */}
                                    <div style={{ fontSize: '0.875rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '0.25rem' }}>
                                        {trip.orderNumber || trip.orderId || '—'}
                                    </div>

                                    {/* Enquiry Number - Tertiary */}
                                    {trip.enquiryNumber && (
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                                            From {trip.enquiryNumber}
                                        </div>
                                    )}


                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    {(trip.paymentMode === 'To Pay' || trip.consignor?.paymentBy === 'Consignee') ? (
                                        <>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                                Total Freight
                                            </div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f97316' }}>
                                                TO PAY
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                                Total Freight
                                            </div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
                                                {trip.amount}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Details Grid */}
                            < div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem',
                                paddingTop: '1rem',
                                borderTop: '1px solid #e2e8f0'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Route</div>
                                    <div style={{ fontWeight: '500' }}>{trip.route}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Truck & Driver</div>
                                    <div style={{ fontWeight: '500' }}>{trip.vehicleNo || 'unassigned'} <span className="text-xs text-slate-400">({trip.truck})</span></div>
                                    {trip.driverPhone && (
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <span>📞</span> {trip.driverPhone}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Material</div>
                                    <div style={{ fontWeight: '500' }}>{trip.material}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Consignee</div>
                                    <div style={{ fontWeight: '500' }}>{trip.consignee}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{trip.consigneePhone}</div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Current Location</div>
                                    <div style={{ fontWeight: '500', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <MapPin size={14} className="text-indigo-600" />
                                        {trip.currentLocation}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Payment</div>
                                    <div style={{
                                        fontWeight: '700',
                                        color: (trip.paymentMode === 'To Pay' || trip.consignor?.paymentBy === 'Consignee') ? '#ea580c' : '#15803d',
                                        fontSize: '0.75rem',
                                        background: (trip.paymentMode === 'To Pay' || trip.consignor?.paymentBy === 'Consignee') ? '#ffedd5' : '#dcfce7',
                                        padding: '0.125rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        display: 'inline-block'
                                    }}>
                                        {(trip.paymentMode === 'To Pay' || trip.consignor?.paymentBy === 'Consignee') ? 'TO PAY' : 'PAID'}
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))
                )}
            </div >
        </div >
    );
};
export default Trips;
