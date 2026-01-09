import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Search, Plus, Phone, Mail, User, Shield, Edit, Trash2, X, Lock, Key } from 'lucide-react';

const Users = () => {
    const { users, addUser, updateUser, deleteUser, getCurrentUser } = useAdmin();
    const currentUser = getCurrentUser();
    const isMasterAdmin = currentUser?.role === 'Master Admin';

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditCredentialsModalOpen, setIsEditCredentialsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'Staff',
        password: '' // Only for new user creation
    });

    const [credentialsForm, setCredentialsForm] = useState({
        name: '',
        email: '',
        password: ''
    });

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                password: '' // Don't show password for editing
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                role: 'Staff',
                password: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleOpenCredentialsModal = (user) => {
        setEditingUser(user);
        setCredentialsForm({
            name: user.name, // Display Name
            email: user.email, // Login ID
            password: ''
        });
        setIsEditCredentialsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            role: 'Staff',
            password: ''
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.role) {
            alert('Please fill in required fields (Name, Email, Role)');
            return;
        }

        if (editingUser) {
            updateUser(editingUser.id, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role
            });
            alert('User updated successfully!');
        } else {
            if (!formData.password) {
                alert('Password is required for new users');
                return;
            }
            addUser(formData);
            alert('User added successfully!');
        }

        handleCloseModal();
    };

    const handleCredentialsSubmit = (e) => {
        e.preventDefault();

        const updates = {
            name: credentialsForm.name,
            email: credentialsForm.email
        };

        if (credentialsForm.password) {
            updates.password = credentialsForm.password;
        }

        updateUser(editingUser.id, updates);
        setIsEditCredentialsModalOpen(false);
        setEditingUser(null);
        alert('User credentials updated successfully!');
    };

    const handleDelete = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteUser(userId);
            alert('User deleted successfully!');
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'Admin': return { background: '#fee2e2', color: '#dc2626' };
            case 'Manager': return { background: '#dbeafe', color: '#2563eb' };
            default: return { background: '#f3f4f6', color: '#4b5563' };
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="admin-header">
                <div>
                    <h1>User Management</h1>
                    <p>Manage system users, staff, and access roles</p>
                </div>
                {isMasterAdmin && (
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => handleOpenModal()}
                    >
                        <Plus size={16} /> Add New User
                    </button>
                )}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="admin-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Users</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{users.length}</div>
                        </div>
                        <User size={32} style={{ opacity: 0.8 }} />
                    </div>
                </div>

                <div className="admin-card" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Admins</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{users.filter(u => u.role === 'Admin').length}</div>
                        </div>
                        <Shield size={32} style={{ opacity: 0.8 }} />
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
                        placeholder="Search by name, email, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Users Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {filteredUsers.map(user => (
                    <div key={user.id} className="admin-card" style={{ position: 'relative' }}>
                        {/* Actions */}
                        {isMasterAdmin && (
                            <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => handleOpenModal(user)}
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
                                    title="Edit Details"
                                >
                                    <Edit size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id)}
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
                                    title="Delete User"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )}

                        {/* User Info */}
                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'var(--admin-bg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--admin-text-light)'
                            }}>
                                <User size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--admin-text)', marginBottom: '0.25rem' }}>
                                    {user.name}
                                </h3>
                                <span style={{
                                    fontSize: '0.75rem',
                                    padding: '0.125rem 0.5rem',
                                    borderRadius: '99px',
                                    fontWeight: '600',
                                    ...getRoleBadgeColor(user.role)
                                }}>
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-text)' }}>
                                <Mail size={14} style={{ color: 'var(--admin-text-light)' }} />
                                <a href={`mailto:${user.email}`} style={{ color: 'var(--admin-accent)', textDecoration: 'none' }}>
                                    {user.email}
                                </a>
                            </div>

                            {user.phone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-text)' }}>
                                    <Phone size={14} style={{ color: 'var(--admin-text-light)' }} />
                                    <a href={`tel:${user.phone}`} style={{ color: 'var(--admin-accent)', textDecoration: 'none' }}>
                                        {user.phone}
                                    </a>
                                </div>
                            )}

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
                                        <Shield size={12} />
                                        <span style={{ fontWeight: '600' }}>Portal Credentials:</span>
                                    </div>
                                    <div style={{ marginLeft: '1rem', display: 'grid', gap: '0.1rem' }}>
                                        <div>Login ID: <span style={{ fontFamily: 'monospace', color: 'var(--admin-primary)', fontWeight: '600' }}>{user.email}</span></div>
                                    </div>
                                </div>
                                {isMasterAdmin && (
                                    <button
                                        className="admin-btn admin-btn-outline"
                                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                                        onClick={() => handleOpenCredentialsModal(user)}
                                    >
                                        <Key size={14} /> Edit Password
                                    </button>
                                )}
                            </div>
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
                                Status: <span style={{ fontWeight: '600', color: user.status === 'Active' ? '#10b981' : '#ef4444' }}>{user.status}</span>
                            </div>
                            <div>
                                Last Login: <span style={{ fontWeight: '500' }}>{user.lastLogin || 'Never'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-light)' }}>
                    No users found matching your search.
                </div>
            )}

            {/* Add/Edit User Details Modal */}
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
                                {editingUser ? 'Edit User Details' : 'Add New User'}
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
                                        Full Name <span style={{ color: 'var(--admin-danger)' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--admin-border)', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                        Email Address (Login ID) <span style={{ color: 'var(--admin-danger)' }}>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--admin-border)', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                                        placeholder="staff@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--admin-border)', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                        Role / Access Level <span style={{ color: 'var(--admin-danger)' }}>*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--admin-border)', borderRadius: '0.5rem', fontSize: '0.875rem', background: 'white' }}
                                    >
                                        <option value="Staff">Staff</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Driver">Driver</option>
                                        <option value="Accountant">Accountant</option>
                                    </select>
                                </div>

                                {!editingUser && (
                                    <div style={{
                                        marginTop: '1rem',
                                        paddingTop: '1rem',
                                        borderTop: '2px solid var(--admin-border)',
                                        background: '#f8fafc',
                                        padding: '1rem',
                                        borderRadius: '0.5rem'
                                    }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Shield size={16} /> Portal Credentials
                                        </h4>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                            Initial Password <span style={{ color: 'var(--admin-danger)' }}>*</span>
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-light)' }} />
                                            <input
                                                type="password"
                                                required
                                                style={{ width: '100%', padding: '0.625rem 0.625rem 0.625rem 2.5rem', border: '1px solid var(--admin-border)', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                                                placeholder="Create password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', marginTop: '0.25rem' }}>
                                            User can change this password after first login
                                        </div>
                                    </div>
                                )}
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
                                    {editingUser ? 'Update Details' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Credentials Modal */}
            {isEditCredentialsModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="admin-card" style={{ width: '100%', maxWidth: '500px', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Edit User Credentials</h3>
                            <button onClick={() => setIsEditCredentialsModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-light)', marginBottom: '1.5rem' }}>
                            User: <strong>{editingUser?.name}</strong>
                        </p>
                        <form onSubmit={handleCredentialsSubmit} style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Display Name *</label>
                                <input
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem',
                                        border: '1px solid var(--admin-border)',
                                        borderRadius: '0.5rem'
                                    }}
                                    required
                                    value={credentialsForm.name}
                                    onChange={e => setCredentialsForm({ ...credentialsForm, name: e.target.value })}
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Login ID (Email) *</label>
                                <input
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem',
                                        border: '1px solid var(--admin-border)',
                                        borderRadius: '0.5rem',
                                        fontFamily: 'monospace'
                                    }}
                                    required
                                    value={credentialsForm.email}
                                    onChange={e => setCredentialsForm({ ...credentialsForm, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>New Password</label>
                                <input
                                    type="text"
                                    style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--admin-border)', borderRadius: '0.5rem', fontFamily: 'monospace' }}
                                    value={credentialsForm.password}
                                    onChange={e => setCredentialsForm({ ...credentialsForm, password: e.target.value })}
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
                                <strong>Note:</strong> Used for logging into the Admin Portal. Ensure the user is informed of any changes.
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setIsEditCredentialsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="admin-btn admin-btn-primary">Update Credentials</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
