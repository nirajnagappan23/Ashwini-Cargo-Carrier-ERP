import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Plus, Search, Mail, Phone, MapPin, CreditCard, Edit, Key, User as UserIcon, X, Check } from 'lucide-react';

const Clients = () => {
    const { clients, addClient, updateClient } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [newClient, setNewClient] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        gst: '',
        username: '', // This remains Login ID to avoid breaking backend/context
        displayName: '', // New field for addressing user
        password: ''
    });
    const [editForm, setEditForm] = useState({
        username: '',
        displayName: '',
        password: ''
    });
    const [usernameType, setUsernameType] = useState('email'); // 'email' or 'phone'

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.displayName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUsernameTypeChange = (type) => {
        setUsernameType(type);
        if (type === 'email') {
            setNewClient({ ...newClient, username: newClient.email });
        } else {
            setNewClient({ ...newClient, username: newClient.phone });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Ensure login ID (username variable) is set
        const clientData = {
            ...newClient,
            username: newClient.username || (usernameType === 'email' ? newClient.email : newClient.phone),
            displayName: newClient.displayName || newClient.name // Fallback to company name if empty
        };

        addClient(clientData);
        setIsModalOpen(false);
        setNewClient({ name: '', phone: '', email: '', address: '', gst: '', username: '', displayName: '', password: '' });
        setUsernameType('email');
    };

    const handleEditCredentials = (client) => {
        setEditingClient(client);
        setEditForm({
            username: client.username || client.email,
            displayName: client.displayName || client.name,
            password: '' // Don't show existing password
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateCredentials = (e) => {
        e.preventDefault();
        updateClient(editingClient.id, {
            username: editForm.username,
            displayName: editForm.displayName,
            ...(editForm.password && { password: editForm.password }) // Only update password if provided
        });
        setIsEditModalOpen(false);
        setEditingClient(null);
        setEditForm({ username: '', displayName: '', password: '' });
        alert('Client credentials updated successfully!');
    };

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1>Clients</h1>
                    <p>Manage client information and portal access</p>
                </div>
                <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={18} /> Add Client
                </button>
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
                        placeholder="Search by company name, email, or display name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {filteredClients.map(client => (
                    <div key={client.id} className="admin-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {client.name}
                                    <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--admin-text-light)', background: 'var(--admin-bg)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                        {client.id}
                                    </span>
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--admin-text-light)', marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} /> {client.email}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> {client.phone}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CreditCard size={14} /> GST: {client.gst}</div>
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <MapPin size={14} /> {client.address}
                                </div>

                                {/* Portal Access Info */}
                                <div style={{
                                    marginTop: '0.75rem',
                                    paddingTop: '0.75rem',
                                    borderTop: '1px solid var(--admin-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <UserIcon size={12} />
                                            <span style={{ fontWeight: '600' }}>Portal Access:</span>
                                        </div>
                                        <div style={{ marginLeft: '1rem', display: 'grid', gap: '0.1rem' }}>
                                            <div>Username: <span style={{ color: 'var(--admin-text)', fontWeight: '500' }}>{client.displayName || client.name}</span></div>
                                            <div>Login ID: <span style={{ fontFamily: 'monospace', color: 'var(--admin-primary)', fontWeight: '600' }}>{client.username || client.email}</span></div>
                                        </div>
                                    </div>
                                    <button
                                        className="admin-btn admin-btn-outline"
                                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                                        onClick={() => handleEditCredentials(client)}
                                    >
                                        <Key size={14} /> Edit Credentials
                                    </button>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>Total Orders</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--admin-primary)' }}>
                                    {client.totalOrders || 0}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-danger)', marginTop: '0.5rem', fontWeight: '600' }}>
                                    Pending: ₹{client.pendingPayment?.toLocaleString() || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredClients.length === 0 && (
                <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-light)' }}>
                    No clients found matching your search.
                </div>
            )}

            {/* Add Client Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="admin-card" style={{ width: '100%', maxWidth: '600px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Add New Client</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Company Name *</label>
                                <input
                                    style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--admin-border)', borderRadius: '0.5rem' }}
                                    required
                                    value={newClient.name}
                                    onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Email *</label>
                                    <input
                                        type="email"
                                        style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--admin-border)', borderRadius: '0.5rem' }}
                                        required
                                        value={newClient.email}
                                        onChange={e => {
                                            const updatedClient = { ...newClient, email: e.target.value };
                                            if (usernameType === 'email') {
                                                updatedClient.username = e.target.value;
                                            }
                                            setNewClient(updatedClient);
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Phone *</label>
                                    <input
                                        type="tel"
                                        style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--admin-border)', borderRadius: '0.5rem' }}
                                        required
                                        value={newClient.phone}
                                        onChange={e => {
                                            const updatedClient = { ...newClient, phone: e.target.value };
                                            if (usernameType === 'phone') {
                                                updatedClient.username = e.target.value;
                                            }
                                            setNewClient(updatedClient);
                                        }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>GST Number *</label>
                                    <input
                                        style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--admin-border)', borderRadius: '0.5rem' }}
                                        required
                                        value={newClient.gst}
                                        onChange={e => setNewClient({ ...newClient, gst: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Address *</label>
                                    <input
                                        style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--admin-border)', borderRadius: '0.5rem' }}
                                        required
                                        value={newClient.address}
                                        onChange={e => setNewClient({ ...newClient, address: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Portal Access Section */}
                            <div style={{
                                marginTop: '1rem',
                                paddingTop: '1rem',
                                borderTop: '2px solid var(--admin-border)',
                                background: '#f8fafc',
                                padding: '1rem',
                                borderRadius: '0.5rem'
                            }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Key size={16} /> Client Portal Access
                                </h4>

                                {/* Username Field */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Username (Display Name) *</label>
                                    <input
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem',
                                            border: '1px solid var(--admin-border)',
                                            borderRadius: '0.5rem'
                                        }}
                                        required
                                        placeholder="e.g. Ramesh Kumar (Greeting Name)"
                                        value={newClient.displayName}
                                        onChange={e => setNewClient({ ...newClient, displayName: e.target.value })}
                                    />
                                </div>

                                {/* Login ID Field */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Login ID *</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => handleUsernameTypeChange('email')}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                border: `2px solid ${usernameType === 'email' ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                                                background: usernameType === 'email' ? '#e0e7ff' : 'white',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Use Email
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleUsernameTypeChange('phone')}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                border: `2px solid ${usernameType === 'phone' ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                                                background: usernameType === 'phone' ? '#e0e7ff' : 'white',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Use Phone
                                        </button>
                                    </div>
                                    <input
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem',
                                            border: '1px solid var(--admin-border)',
                                            borderRadius: '0.5rem',
                                            fontFamily: 'monospace',
                                            background: '#f1f5f9'
                                        }}
                                        required
                                        value={newClient.username || (usernameType === 'email' ? newClient.email : newClient.phone)}
                                        onChange={e => setNewClient({ ...newClient, username: e.target.value })}
                                        placeholder={usernameType === 'email' ? 'Email will be used' : 'Phone will be used'}
                                        readOnly // Usually read-only because it follows email/phone
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Password *</label>
                                    <input
                                        type="text"
                                        style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--admin-border)', borderRadius: '0.5rem', fontFamily: 'monospace' }}
                                        required
                                        value={newClient.password}
                                        onChange={e => setNewClient({ ...newClient, password: e.target.value })}
                                        placeholder="Create password for client"
                                    />
                                    <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', marginTop: '0.25rem' }}>
                                        Client can change this password after first login
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="admin-btn admin-btn-primary">Create Client Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Credentials Modal */}
            {isEditModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="admin-card" style={{ width: '100%', maxWidth: '500px', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Edit Portal Credentials</h3>
                            <button onClick={() => setIsEditModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-light)', marginBottom: '1.5rem' }}>
                            Client: <strong>{editingClient?.name}</strong>
                        </p>
                        <form onSubmit={handleUpdateCredentials} style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Username (Display Name) *</label>
                                <input
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem',
                                        border: '1px solid var(--admin-border)',
                                        borderRadius: '0.5rem'
                                    }}
                                    required
                                    value={editForm.displayName}
                                    onChange={e => setEditForm({ ...editForm, displayName: e.target.value })}
                                    placeholder="e.g. Ramesh Kumar"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Login ID *</label>
                                <input
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem',
                                        border: '1px solid var(--admin-border)',
                                        borderRadius: '0.5rem',
                                        fontFamily: 'monospace'
                                    }}
                                    required
                                    value={editForm.username}
                                    onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                                />
                                <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', marginTop: '0.25rem' }}>
                                    Can be email or phone number
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>New Password</label>
                                <input
                                    type="text"
                                    style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--admin-border)', borderRadius: '0.5rem', fontFamily: 'monospace' }}
                                    value={editForm.password}
                                    onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                                    placeholder="Leave blank to keep current password"
                                />
                                <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', marginTop: '0.25rem' }}>
                                    Only fill if you want to change the password
                                </div>
                            </div>

                            <div style={{
                                background: '#fef3c7',
                                border: '1px solid #fbbf24',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.75rem',
                                color: '#92400e'
                            }}>
                                <strong>Note:</strong> Changing credentials will not affect the client's dashboard history or data. All orders, documents, and chat history will remain intact.
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                <button type="submit" className="admin-btn admin-btn-primary">Update Credentials</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;
