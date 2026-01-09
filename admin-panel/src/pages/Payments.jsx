import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Filter, Upload, Eye, FileText, CheckCircle, AlertCircle, Search, Edit, X, Plus } from 'lucide-react';

const Payments = () => {
    const { orders, updateOrderDetails, recordPayment, addDocument } = useAdmin();
    const [clientFilter, setClientFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Editing State for inline edits
    const [editingFinancial, setEditingFinancial] = useState({ id: null, field: null }); // { id: 'orderId', field: 'advance'|'balance' }
    const [tempValue, setTempValue] = useState('');

    // Payment Recording Modal State
    const [paymentModal, setPaymentModal] = useState({
        isOpen: false,
        orderId: null
    });
    const [paymentForm, setPaymentForm] = useState({
        type: 'Advance', // Advance, Second Advance, Balance, Halting, Custom
        customType: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    // Upload Modal State (Generic)
    const [uploadModal, setUploadModal] = useState({
        isOpen: false,
        orderId: null,
        docType: null
    });

    const distinctClients = [...new Set(orders.map(o => o.clientName).filter(Boolean))];

    const filteredOrders = orders.filter(order => {
        const matchesClient = clientFilter === '' || order.clientName === clientFilter;
        const matchesSearch = !searchTerm ||
            order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.clientRef?.toLowerCase().includes(searchTerm.toLowerCase());
        const isConfirmed = order.status === 'Confirmed';
        return matchesClient && matchesSearch && isConfirmed;
    });

    // --- Inline Edit Handlers ---
    const startEditing = (order, field) => {
        setEditingFinancial({ id: order.id, field });
        setTempValue(order[field]?.toString() || '0');
    };

    const saveEditing = (orderId, field) => {
        const value = parseFloat(tempValue) || 0;
        updateOrderDetails(orderId, { [field]: value });
        setEditingFinancial({ id: null, field: null });
    };

    const cancelEditing = () => {
        setEditingFinancial({ id: null, field: null });
        setTempValue('');
    };

    // --- Payment Recording Handlers ---
    const openPaymentModal = (orderId) => {
        setPaymentModal({ isOpen: true, orderId });
        setPaymentForm({
            type: 'Advance',
            customType: '', // Reset
            amount: '',
            date: new Date().toISOString().split('T')[0],
            notes: ''
        });
    };

    const handlePaymentSubmit = () => {
        if (!paymentForm.amount) return alert("Please enter amount");

        const finalType = paymentForm.type === 'Custom' ? paymentForm.customType : paymentForm.type;
        if (!finalType) return alert("Please specify payment type");

        recordPayment(paymentModal.orderId, {
            type: finalType,
            amount: paymentForm.amount,
            date: paymentForm.date,
            notes: paymentForm.notes
        });

        // If user wants to upload receipt immediately, they can do it via the generic upload flow or we could bundle it.
        // For simplicity, let's keep them separate flows or suggest uploading next. 
        // User asked "Upload Multiple Payment Receipts" - sticking to the dedicated upload button is cleaner, 
        // but let's add a "Receipt Uploaded" check? No, let's just close and maybe prompt.

        setPaymentModal({ isOpen: false, orderId: null });
        alert("Payment Recorded Successfully");
    };

    // --- Generic Upload Handlers ---
    const handleUploadClick = (orderId, docType) => {
        setUploadModal({ isOpen: true, orderId, docType });
    };

    const handleUploadSubmit = () => {
        // Here we would handle file upload. For now mock addDocument.
        if (uploadModal.docType === 'Payment Receipt') {
            // If multiple receipts, we might want to ask "For which payment?" or just add generic.
            // Adding generic payment receipt is fine.
        }

        addDocument(uploadModal.orderId, {
            name: uploadModal.docType, // Could be refined
            type: uploadModal.docType,
            uploadedBy: 'Admin',
            url: '#'
        });

        alert(`Uploaded ${uploadModal.docType}`);
        setUploadModal({ isOpen: false, orderId: null, docType: null });
    };

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1>Payments</h1>
                    <p>Manage freight bills, receipts, and balances</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '200px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-light)' }} />
                        <input
                            type="text"
                            placeholder="Search Order..."
                            className="admin-input pl-10"
                            style={{ width: '100%', paddingLeft: '2.5rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ position: 'relative', width: '200px' }}>
                        <Filter size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-light)' }} />
                        <select
                            className="admin-input pl-10"
                            style={{ width: '100%', paddingLeft: '2.5rem', appearance: 'none' }}
                            value={clientFilter}
                            onChange={(e) => setClientFilter(e.target.value)}
                        >
                            <option value="">All Clients</option>
                            {distinctClients.map(client => (
                                <option key={client} value={client}>{client}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {filteredOrders.map(order => (
                    <div key={order.id} className="admin-card">
                        {/* Order Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)' }}>
                            <div>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                                        {order.orderId || order.id}
                                        {order.consignments?.[0]?.lrNumber && <span style={{ fontSize: '0.9rem', color: '#666', marginLeft: '8px', fontWeight: '500' }}>| LR: {order.consignments.map(c => c.lrNumber).join(', ')}</span>}
                                    </h3>
                                    <span className="admin-badge badge-success">{order.status}</span>
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-light)' }}>
                                    Ref: {order.clientRef} | {order.clientName} | {order.orderDate}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-light)' }}>Total Freight</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>₹{order.totalFreight?.toLocaleString() || '0'}</div>
                            </div>
                        </div>

                        {/* Financials & Documents Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>

                            {/* Left: Financials */}
                            <div style={{ display: 'grid', gap: '1rem', alignContent: 'start' }}>
                                {/* Advance Field */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Advance Paid</div>
                                    {editingFinancial.id === order.id && editingFinancial.field === 'advance' ? (
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            <input
                                                type="number"
                                                value={tempValue}
                                                onChange={(e) => setTempValue(e.target.value)}
                                                style={{ width: '80px', padding: '0.25rem', border: '1px solid #ccc', borderRadius: '4px' }}
                                                autoFocus
                                            />
                                            <button onClick={() => saveEditing(order.id, 'advance')} className="text-green-600"><CheckCircle size={16} /></button>
                                            <button onClick={cancelEditing} className="text-red-600"><X size={16} /></button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#16a34a' }}>₹{order.advance?.toLocaleString() || '0'}</div>
                                            <button onClick={() => startEditing(order, 'advance')} className="text-slate-400 hover:text-blue-600"><Edit size={12} /></button>
                                        </div>
                                    )}
                                </div>

                                {/* Balance Field */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Balance Due</div>
                                    {editingFinancial.id === order.id && editingFinancial.field === 'balance' ? (
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            <input
                                                type="number"
                                                value={tempValue}
                                                onChange={(e) => setTempValue(e.target.value)}
                                                style={{ width: '80px', padding: '0.25rem', border: '1px solid #ccc', borderRadius: '4px' }}
                                                autoFocus
                                            />
                                            <button onClick={() => saveEditing(order.id, 'balance')} className="text-green-600"><CheckCircle size={16} /></button>
                                            <button onClick={cancelEditing} className="text-red-600"><X size={16} /></button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#dc2626' }}>₹{order.balance?.toLocaleString() || '0'}</div>
                                            <button onClick={() => startEditing(order, 'balance')} className="text-slate-400 hover:text-blue-600"><Edit size={12} /></button>
                                        </div>
                                    )}
                                </div>

                                {/* Record Payment Action */}
                                <div style={{ padding: '0.75rem', border: '1px dashed var(--admin-border)', borderRadius: '0.5rem', textAlign: 'center' }}>
                                    <button
                                        onClick={() => openPaymentModal(order.id)}
                                        style={{ width: '100%', padding: '0.5rem', background: 'var(--admin-primary)', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <Plus size={16} /> Record Payment
                                    </button>
                                </div>
                            </div>

                            {/* Right: Documents Actions */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                {/* Receipt */}
                                <div style={{ border: '1px solid var(--admin-border)', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center' }}>
                                    <div style={{ marginBottom: '0.5rem', color: 'var(--admin-text-light)' }}><FileText size={24} /></div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Payment Receipts</div>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => handleUploadClick(order.id, 'Payment Receipt')}
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'white', border: '1px solid var(--admin-border)', borderRadius: '0.25rem', cursor: 'pointer' }}
                                        >
                                            <Upload size={12} /> Upload
                                        </button>
                                        <button style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'white', border: '1px solid var(--admin-border)', borderRadius: '0.25rem', cursor: 'pointer' }}>
                                            <Eye size={12} />
                                        </button>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-2">
                                        Multiple Allowed
                                    </div>
                                </div>

                                {/* Freight Bill */}
                                <div style={{ border: '1px solid var(--admin-border)', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center' }}>
                                    <div style={{ marginBottom: '0.5rem', color: 'var(--admin-text-light)' }}><FileText size={24} /></div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Freight Bill</div>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => handleUploadClick(order.id, 'Freight Bill')}
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'white', border: '1px solid var(--admin-border)', borderRadius: '0.25rem', cursor: 'pointer' }}
                                        >
                                            <Upload size={12} /> Upload
                                        </button>
                                        <button style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'white', border: '1px solid var(--admin-border)', borderRadius: '0.25rem', cursor: 'pointer' }}>
                                            <Eye size={12} />
                                        </button>
                                    </div>
                                </div>

                                {/* LR Copy */}
                                <div style={{ border: '1px solid var(--admin-border)', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center' }}>
                                    <div style={{ marginBottom: '0.5rem', color: 'var(--admin-text-light)' }}><FileText size={24} /></div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>LR Copy</div>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => handleUploadClick(order.id, 'LR Copy')}
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'white', border: '1px solid var(--admin-border)', borderRadius: '0.25rem', cursor: 'pointer' }}
                                        >
                                            <Upload size={12} /> Upload
                                        </button>
                                        <button style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'white', border: '1px solid var(--admin-border)', borderRadius: '0.25rem', cursor: 'pointer' }}>
                                            <Eye size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Upload Modal (Existing) */}
            {uploadModal.isOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="admin-card" style={{ width: '100%', maxWidth: '400px', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Upload {uploadModal.docType}</h3>
                        <div style={{ border: '2px dashed var(--admin-border)', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', marginBottom: '1rem', color: 'var(--admin-text-light)' }}>
                            <Upload size={32} style={{ marginBottom: '0.5rem' }} />
                            <p>Click to select file or drag and drop</p>
                            <p className="text-xs mt-2 text-slate-400">Supports Multiple Files</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                className="admin-btn admin-btn-outline"
                                onClick={() => setUploadModal({ isOpen: false, orderId: null, docType: null })}
                            >
                                Cancel
                            </button>
                            <button
                                className="admin-btn admin-btn-primary"
                                onClick={handleUploadSubmit}
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Record Payment Modal (New) */}
            {paymentModal.isOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="admin-card" style={{ width: '100%', maxWidth: '400px', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>Record Payment</h3>
                            <button onClick={() => setPaymentModal({ isOpen: false, orderId: null })} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Payment Type</label>
                                <select
                                    className="admin-input w-full p-2 border rounded"
                                    value={paymentForm.type}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
                                >
                                    <option value="Advance">Advance</option>
                                    <option value="Second Advance">Second Advance</option>
                                    <option value="Balance">Balance</option>
                                    <option value="Halting">Halting</option>
                                    <option value="Custom">Other (Custom)</option>
                                </select>
                            </div>

                            {paymentForm.type === 'Custom' && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Specify Type</label>
                                    <input
                                        className="admin-input w-full p-2 border rounded"
                                        placeholder="e.g. Detention Charges"
                                        value={paymentForm.customType}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, customType: e.target.value })}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Amount (₹)</label>
                                <input
                                    type="number"
                                    className="admin-input w-full p-2 border rounded"
                                    placeholder="0.00"
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                                <input
                                    type="date"
                                    className="admin-input w-full p-2 border rounded"
                                    value={paymentForm.date}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Notes</label>
                                <textarea
                                    className="admin-input w-full p-2 border rounded"
                                    placeholder="Optional notes..."
                                    rows="2"
                                    value={paymentForm.notes}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                                />
                            </div>

                            {/* Optional: Immediate receipt upload trigger checkbox? 
                                User asked for "Upload Multiple Payment Receipts" option separately on page.
                                Let's keep this clean.
                            */}
                        </div>

                        <div className="flex gap-2 justify-end mt-6">
                            <button
                                className="admin-btn admin-btn-outline"
                                onClick={() => setPaymentModal({ isOpen: false, orderId: null })}
                            >
                                Cancel
                            </button>
                            <button
                                className="admin-btn admin-btn-primary"
                                onClick={handlePaymentSubmit}
                            >
                                Record Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments;
