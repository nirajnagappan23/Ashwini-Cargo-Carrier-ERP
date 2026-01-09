import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Search, Plus, Phone, Mail, MapPin, Calendar, Package, Edit, Trash2, X } from 'lucide-react';

const Brokers = () => {
    const { brokers, addBroker, setBrokers } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBroker, setEditingBroker] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        gst: ''
    });

    const filteredBrokers = brokers.filter(broker =>
        broker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        broker.phone.includes(searchTerm) ||
        broker.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (broker = null) => {
        if (broker) {
            setEditingBroker(broker);
            setFormData({
                name: broker.name,
                phone: broker.phone,
                email: broker.email,
                address: broker.address,
                gst: broker.gst
            });
        } else {
            setEditingBroker(null);
            setFormData({
                name: '',
                phone: '',
                email: '',
                address: '',
                gst: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBroker(null);
        setFormData({
            name: '',
            phone: '',
            email: '',
            address: '',
            gst: ''
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.phone) {
            alert('Please fill in required fields (Name and Phone)');
            return;
        }

        if (editingBroker) {
            // Update existing broker
            setBrokers(brokers.map(b =>
                b.id === editingBroker.id
                    ? { ...b, ...formData }
                    : b
            ));
            alert('Broker updated successfully!');
        } else {
            // Add new broker
            addBroker(formData);
            alert('Broker added successfully!');
        }

        handleCloseModal();
    };

    const handleDelete = (brokerId) => {
        if (window.confirm('Are you sure you want to delete this broker?')) {
            setBrokers(brokers.filter(b => b.id !== brokerId));
            alert('Broker deleted successfully!');
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="admin-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h1>Brokers & Truck Operators</h1>
                        <p>Manage your broker and truck operator contacts</p>
                    </div>
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => handleOpenModal()}
                    >
                        <Plus size={16} /> Add New Broker
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="admin-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Brokers</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{brokers.length}</div>
                        </div>
                        <Package size={32} style={{ opacity: 0.8 }} />
                    </div>
                </div>

                <div className="admin-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Active This Month</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{brokers.filter(b => {
                                const lastUsed = new Date(b.lastUsed);
                                const now = new Date();
                                return lastUsed.getMonth() === now.getMonth() && lastUsed.getFullYear() === now.getFullYear();
                            }).length}</div>
                        </div>
                        <Calendar size={32} style={{ opacity: 0.8 }} />
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-light)' }} />
                    <input
                        style={{
                            width: '100%',
                            paddingLeft: '2.5rem',
                            paddingRight: '0.75rem',
                            paddingTop: '0.625rem',
                            paddingBottom: '0.625rem',
                            border: '1px solid var(--admin-border)',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem'
                        }}
                        placeholder="Search by name, phone, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Brokers Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {filteredBrokers.map(broker => (
                    <div key={broker.id} className="admin-card" style={{ position: 'relative' }}>
                        {/* Actions */}
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => handleOpenModal(broker)}
                                style={{
                                    padding: '0.375rem',
                                    border: 'none',
                                    background: 'var(--admin-bg)',
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer',
                                    color: 'var(--admin-accent)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Edit size={14} />
                            </button>
                            <button
                                onClick={() => handleDelete(broker.id)}
                                style={{
                                    padding: '0.375rem',
                                    border: 'none',
                                    background: 'var(--admin-bg)',
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer',
                                    color: 'var(--admin-danger)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>

                        {/* Broker Info */}
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>
                                {broker.id}
                            </div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--admin-text)', marginBottom: '0.5rem' }}>
                                {broker.name}
                            </h3>
                        </div>

                        <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-text)' }}>
                                <Phone size={14} style={{ color: 'var(--admin-text-light)' }} />
                                <a href={`tel:${broker.phone}`} style={{ color: 'var(--admin-accent)', textDecoration: 'none' }}>
                                    {broker.phone}
                                </a>
                            </div>

                            {broker.email && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-text)' }}>
                                    <Mail size={14} style={{ color: 'var(--admin-text-light)' }} />
                                    <a href={`mailto:${broker.email}`} style={{ color: 'var(--admin-accent)', textDecoration: 'none' }}>
                                        {broker.email}
                                    </a>
                                </div>
                            )}

                            {broker.address && (
                                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', color: 'var(--admin-text)' }}>
                                    <MapPin size={14} style={{ color: 'var(--admin-text-light)', marginTop: '0.125rem' }} />
                                    <span>{broker.address}</span>
                                </div>
                            )}

                            {broker.gst && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginTop: '0.5rem' }}>
                                    GST: <span style={{ fontFamily: 'monospace' }}>{broker.gst}</span>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div style={{
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid var(--admin-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.75rem',
                            color: 'var(--admin-text-light)'
                        }}>
                            <div>
                                <span style={{ fontWeight: '600', color: 'var(--admin-text)' }}>{broker.totalTrips}</span> trips
                            </div>
                            <div>
                                Last used: <span style={{ fontWeight: '500' }}>{broker.lastUsed}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredBrokers.length === 0 && (
                <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-light)' }}>
                    No brokers found matching your search.
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    padding: '1rem'
                }}>
                    <div className="admin-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                                {editingBroker ? 'Edit Broker' : 'Add New Broker'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--admin-text-light)'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                        Broker Name <span style={{ color: 'var(--admin-danger)' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem',
                                            border: '1px solid var(--admin-border)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                        placeholder="Enter broker/operator name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                        Phone Number <span style={{ color: 'var(--admin-danger)' }}>*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem',
                                            border: '1px solid var(--admin-border)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem',
                                            border: '1px solid var(--admin-border)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                        placeholder="broker@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem',
                                            border: '1px solid var(--admin-border)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                        placeholder="City, State"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                        GST Number
                                    </label>
                                    <input
                                        type="text"
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem',
                                            border: '1px solid var(--admin-border)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            fontFamily: 'monospace'
                                        }}
                                        placeholder="27AABCU9603R1ZM"
                                        value={formData.gst}
                                        onChange={(e) => setFormData({ ...formData, gst: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="admin-btn admin-btn-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="admin-btn admin-btn-primary"
                                >
                                    {editingBroker ? 'Update Broker' : 'Add Broker'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Brokers;
