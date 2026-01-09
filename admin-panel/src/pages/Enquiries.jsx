import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Search, DollarSign, Plus, X, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getExpiryCountdown, isEnquiryExpired } from '../utils/numberingSystem';


const Enquiries = () => {
    const { orders, updateOrderDetails, confirmOrder } = useAdmin();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingEnquiry, setEditingEnquiry] = useState(null);
    const [editForm, setEditForm] = useState({});

    // Filter enquiries (active ones)
    const activeEnquiries = orders.filter(o => o.status !== 'Confirmed' && o.status !== 'Rejected');

    const filteredEnquiries = activeEnquiries.filter(enq => {
        const matchesSearch = enq.clientRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enq.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enq.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleAccept = (enquiry) => {
        if (window.confirm("Are you sure you want to accept this enquiry and place the order?")) {
            // Confirm with 0 price (to be updated later during Freight Bill)
            confirmOrder(enquiry.id, 0);
            alert("Enquiry Accepted and Order Placed!");
        }
    };

    const handleReject = (id) => {
        if (window.confirm("Are you sure you want to reject this enquiry?")) {
            updateOrderDetails(id, { status: 'Rejected' });
        }
    };

    const openEditModal = (enquiry) => {
        navigate('/book-trip', { state: { editingEnquiry: enquiry } });
    };

    // handleEditSubmit removed as it's now handled in BookTrip

    const handleEditSubmit = () => {
        // Update the enquiry with new details
        const originalEnq = orders.find(o => o.id === editingEnquiry);

        const updatedEnquiry = {
            pickupDate: editForm.pickupDate,
            route: editForm.route,
            materials: [{
                ...(originalEnq?.materials?.[0] || {}),
                type: editForm.materialType,
                weight: editForm.materialWeight
            }],
            drops: [{
                ...(originalEnq?.drops?.[0] || {}),
                companyName: editForm.consigneeName,
                phone: editForm.consigneePhone,
                address: editForm.destinationAddress
            }],
            consignor: {
                ...(originalEnq?.consignor || {}),
                address: editForm.pickupAddress
            }
        };

        updateOrderDetails(editingEnquiry, updatedEnquiry);
        setEditingEnquiry(null);
        alert("Enquiry Updated Successfully");
    };

    return (
        <div>
            <div className="admin-header">
                <h1>Enquiries</h1>
                <p>Manage customer enquiries, accept orders, or reject requests</p>
            </div>

            {/* Search */}
            <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-light)' }} />
                    <input
                        type="text"
                        placeholder="Search by Enquiry ID, Client Ref, or Client Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.625rem 0.75rem 0.625rem 2.5rem',
                            border: '1px solid var(--admin-border)',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem'
                        }}
                    />
                </div>
            </div>

            {/* Enquiries List */}
            <div style={{ display: 'grid', gap: '1rem' }}>
                {filteredEnquiries.map(enq => (
                    <div key={enq.id} className="admin-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div>
                                {/* Enquiry Number - Primary */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--admin-primary)', fontFamily: 'monospace' }}>
                                        {enq.enquiryNumber || enq.id}
                                    </h3>
                                    <span className="admin-badge badge-warning">
                                        {(enq.status === 'Negotiation' || enq.status === 'Quoted') ? 'Active Enquiry' : (enq.status || 'Pending')}
                                    </span>
                                </div>

                                {/* Client & Date */}
                                <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>
                                    {enq.clientName || 'N/A'} • {enq.date}
                                </div>

                                {/* Expiry Countdown */}
                                {enq.createdAt && !isEnquiryExpired(enq.createdAt) && (
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        fontSize: '0.75rem',
                                        color: '#f59e0b',
                                        background: '#fef3c7',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.375rem',
                                        marginTop: '0.25rem'
                                    }}>
                                        <Clock size={12} />
                                        {getExpiryCountdown(enq.createdAt)}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className="admin-btn admin-btn-outline"
                                    onClick={() => navigate('/book-trip', { state: { editingEnquiry: enq, mode: 'edit-enquiry' } })}
                                >
                                    Edit Enquiry
                                </button>
                                <button
                                    className="admin-btn admin-btn-primary"
                                    style={{ background: 'var(--admin-success)', borderColor: 'var(--admin-success)' }}
                                    onClick={() => navigate('/book-trip', { state: { editingEnquiry: enq, mode: 'create-trip' } })}
                                >
                                    Create Trip
                                </button>
                                <button
                                    className="admin-btn admin-btn-outline"
                                    style={{ color: 'var(--admin-danger)', borderColor: 'var(--admin-danger)' }}
                                    onClick={() => handleReject(enq.id)}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--admin-border)' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>Client</div>
                                <div style={{ fontWeight: '500' }}>{enq.clientName || 'N/A'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>Route & Date</div>
                                <div style={{ fontWeight: '500' }}>{enq.route}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginTop: '0.25rem' }}>{enq.date}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>Consignee</div>
                                <div style={{ fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={enq.drops?.[0]?.companyName}>{enq.drops?.[0]?.companyName || '-'}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>Ph: {enq.drops?.[0]?.phone || '-'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>Material</div>
                                <div style={{ fontWeight: '500' }}>{enq.materials?.[0]?.type || 'N/A'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>Payment</div>
                                <div style={{
                                    fontWeight: '700',
                                    color: enq.paymentBy === 'Consignee' ? '#c2410c' : '#15803d',
                                    fontSize: '0.75rem',
                                    background: enq.paymentBy === 'Consignee' ? '#ffedd5' : '#dcfce7',
                                    padding: '0.125rem 0.5rem',
                                    borderRadius: '0.25rem',
                                    display: 'inline-block'
                                }}>
                                    {enq.paymentBy === 'Consignee' ? 'TO PAY' : 'PAID'}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredEnquiries.length === 0 && (
                    <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ color: 'var(--admin-text-light)' }}>No active enquiries found.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Enquiries;
