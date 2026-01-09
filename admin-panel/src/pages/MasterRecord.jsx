import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Search, Filter, Eye, Download, Upload, X, CheckCircle, Clock, AlertCircle, FileText, CreditCard, ChevronRight, ChevronDown, Trash2, Database, TrendingUp, Package, Edit } from 'lucide-react';

const MasterRecord = () => {
    const { orders, addDocument, deleteDocument, recordTruckPayment, updateTruckPayment, recordExpense, brokers } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    // Filters
    const [filterClient, setFilterClient] = useState('');
    const [filterPODStatus, setFilterPODStatus] = useState('');

    // Modal States
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

    // Expense State
    const [expenseForm, setExpenseForm] = useState({
        type: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    // Upload State
    const [uploadDocType, setUploadDocType] = useState('LR Copy');

    // Payment State
    const [paymentForm, setPaymentForm] = useState({
        truckHire: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paidTo: '',
        bankAccount: 'AXIS – Corporate Current',
        reference: '',
        type: 'Advance'
    });

    const bankAccounts = [
        'AXIS – Corporate Current',
        'AXIS – Merchant QR',
        'AXIS – Payment Gateway',
        'SBI – CC Account',
        'AXIS – Savings (GPay / PhonePe)'
    ];

    const allowedDocTypes = [
        'LR Copy', 'Freight Bill', 'POD', 'Loading Challan'
    ];

    // Prepare Data
    const records = useMemo(() => {
        return orders.filter(o => o.lrNumber || (o.consignments && o.consignments.length > 0))
            .map(o => {
                const mainLR = o.lrNumber || o.consignments?.[0]?.lrNumber || 'N/A';
                const mainLRDate = o.lrDate || o.consignments?.[0]?.lrDate || o.date;
                const podDoc = o.documents?.find(d => d.type === 'POD');
                const podStatus = podDoc ? 'Uploaded' : 'Pending';
                const totalTruckPaid = (o.truckPaymentHistory || []).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

                return {
                    ...o,
                    mainLR,
                    mainLRDate,
                    podStatus,
                    totalTruckPaid
                };
            });
    }, [orders]);

    // Filter Data
    const filteredRecords = records.filter(r => {
        const matchesSearch = !searchTerm ||
            r.mainLR.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesClient = !filterClient || r.clientName === filterClient;
        const matchesPOD = !filterPODStatus || r.podStatus === filterPODStatus;

        return matchesSearch && matchesClient && matchesPOD;
    });

    const distinctClients = [...new Set(records.map(r => r.clientName))];

    // Stats
    const stats = {
        totalLRs: records.length,
        podPending: records.filter(r => r.podStatus === 'Pending').length,
        totalTruckPayments: records.reduce((sum, r) => sum + r.totalTruckPaid, 0)
    };

    // Handlers
    const toggleSelection = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleDocumentUpload = () => {
        if (!selectedRecord) return;

        addDocument(selectedRecord.id, {
            name: uploadDocType,
            type: uploadDocType,
            uploadedBy: 'Admin',
            url: '#'
        });

        setIsUploadModalOpen(false);
        alert(`Document ${uploadDocType} uploaded to LR ${selectedRecord.mainLR}`);
    };

    const handleRecordPayment = () => {
        if (!selectedRecord) return;
        if (!paymentForm.amount || !paymentForm.reference || !paymentForm.paidTo) {
            alert("Please fill all required fields");
            return;
        }

        if (editingPayment) {
            // Update existing payment
            const paymentData = {
                amount: paymentForm.amount,
                date: paymentForm.date,
                paidTo: paymentForm.paidTo,
                bankAccount: paymentForm.bankAccount,
                reference: paymentForm.reference,
                type: paymentForm.type,
            };

            updateTruckPayment(selectedRecord.id, editingPayment.id, paymentData);

            // Refresh the selected record
            const updatedRecord = orders.find(o => o.id === selectedRecord.id);
            if (updatedRecord) {
                const mainLR = updatedRecord.lrNumber || updatedRecord.consignments?.[0]?.lrNumber || 'N/A';
                const mainLRDate = updatedRecord.lrDate || updatedRecord.consignments?.[0]?.lrDate || updatedRecord.date;
                const podDoc = updatedRecord.documents?.find(d => d.type === 'POD');
                const podStatus = podDoc ? 'Uploaded' : 'Pending';
                const totalTruckPaid = (updatedRecord.truckPaymentHistory || []).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

                setSelectedRecord({
                    ...updatedRecord,
                    mainLR,
                    mainLRDate,
                    podStatus,
                    totalTruckPaid
                });
            }

            setIsPaymentModalOpen(false);
            setEditingPayment(null);
            setPaymentForm({ truckHire: '', amount: '', date: new Date().toISOString().split('T')[0], paidTo: '', bankAccount: 'AXIS – Corporate Current', reference: '', type: 'Advance' });
            alert("Payment Updated Successfully");
        } else {
            // Record new payment
            const paymentData = {
                amount: paymentForm.amount,
                date: paymentForm.date,
                paidTo: paymentForm.paidTo,
                bankAccount: paymentForm.bankAccount,
                reference: paymentForm.reference,
                type: paymentForm.type,
            };

            // If truck hire is provided, update the order
            if (paymentForm.truckHire) {
                paymentData.truckHire = paymentForm.truckHire;
            }

            recordTruckPayment(selectedRecord.id, paymentData);

            // Refresh the selected record to show updated data
            const updatedRecord = orders.find(o => o.id === selectedRecord.id);
            if (updatedRecord) {
                const mainLR = updatedRecord.lrNumber || updatedRecord.consignments?.[0]?.lrNumber || 'N/A';
                const mainLRDate = updatedRecord.lrDate || updatedRecord.consignments?.[0]?.lrDate || updatedRecord.date;
                const podDoc = updatedRecord.documents?.find(d => d.type === 'POD');
                const podStatus = podDoc ? 'Uploaded' : 'Pending';
                const totalTruckPaid = (updatedRecord.truckPaymentHistory || []).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

                setSelectedRecord({
                    ...updatedRecord,
                    mainLR,
                    mainLRDate,
                    podStatus,
                    totalTruckPaid
                });
            }

            setIsPaymentModalOpen(false);
            setPaymentForm({ truckHire: '', amount: '', date: new Date().toISOString().split('T')[0], paidTo: '', bankAccount: 'AXIS – Corporate Current', reference: '', type: 'Advance' });
            alert("Truck Payment Recorded Successfully");
        }
    };

    const handleOpenPaymentModal = (payment = null) => {
        if (payment) {
            // Edit mode
            setEditingPayment(payment);
            setPaymentForm({
                truckHire: '',
                amount: payment.amount,
                date: payment.date,
                paidTo: payment.paidTo,
                bankAccount: payment.bankAccount,
                reference: payment.reference,
                type: payment.type
            });
        } else {
            // New payment mode
            setEditingPayment(null);
            setPaymentForm({
                truckHire: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                paidTo: '',
                bankAccount: 'AXIS – Corporate Current',
                reference: '',
                type: 'Advance'
            });
        }
        setIsPaymentModalOpen(true);
    };

    const handleRecordExpense = () => {
        if (!selectedRecord) return;
        if (!expenseForm.type || !expenseForm.amount) {
            alert("Please fill expense type and amount");
            return;
        }

        recordExpense(selectedRecord.id, {
            type: expenseForm.type,
            amount: expenseForm.amount,
            date: expenseForm.date,
            notes: expenseForm.notes
        });

        // Refresh the selected record
        const updatedRecord = orders.find(o => o.id === selectedRecord.id);
        if (updatedRecord) {
            const mainLR = updatedRecord.lrNumber || updatedRecord.consignments?.[0]?.lrNumber || 'N/A';
            const mainLRDate = updatedRecord.lrDate || updatedRecord.consignments?.[0]?.lrDate || updatedRecord.date;
            const podDoc = updatedRecord.documents?.find(d => d.type === 'POD');
            const podStatus = podDoc ? 'Uploaded' : 'Pending';
            const totalTruckPaid = (updatedRecord.truckPaymentHistory || []).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

            setSelectedRecord({
                ...updatedRecord,
                mainLR,
                mainLRDate,
                podStatus,
                totalTruckPaid
            });
        }

        setIsExpenseModalOpen(false);
        setExpenseForm({ type: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
        alert("Expense Recorded Successfully");
    };

    return (
        <div>
            {/* Header */}
            <div className="admin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <Database size={24} />
                    </div>
                    <div>
                        <h1>Master Record</h1>
                        <p>Centralized LR-wise Accounting & Document Control</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="admin-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total LR Records</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.totalLRs}</div>
                        </div>
                        <Package size={32} style={{ opacity: 0.8 }} />
                    </div>
                </div>

                <div className="admin-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>POD Pending</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.podPending}</div>
                        </div>
                        <AlertCircle size={32} style={{ opacity: 0.8 }} />
                    </div>
                </div>

                <div className="admin-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Truck Payments</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>₹{(stats.totalTruckPayments / 1000).toFixed(0)}K</div>
                        </div>
                        <CreditCard size={32} style={{ opacity: 0.8 }} />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
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
                            placeholder="Search LR, Client, Order..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Filter size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-light)' }} />
                        <select
                            style={{
                                width: '100%',
                                paddingLeft: '2.5rem',
                                paddingRight: '0.75rem',
                                paddingTop: '0.625rem',
                                paddingBottom: '0.625rem',
                                border: '1px solid var(--admin-border)',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                appearance: 'none'
                            }}
                            value={filterClient}
                            onChange={(e) => setFilterClient(e.target.value)}
                        >
                            <option value="">All Clients</option>
                            {distinctClients.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Filter size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-light)' }} />
                        <select
                            style={{
                                width: '100%',
                                paddingLeft: '2.5rem',
                                paddingRight: '0.75rem',
                                paddingTop: '0.625rem',
                                paddingBottom: '0.625rem',
                                border: '1px solid var(--admin-border)',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                appearance: 'none'
                            }}
                            value={filterPODStatus}
                            onChange={(e) => setFilterPODStatus(e.target.value)}
                        >
                            <option value="">All POD Status</option>
                            <option value="Uploaded">Uploaded</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="admin-card">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--admin-border)', textAlign: 'left' }}>
                                <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', width: '40px' }}>
                                    <input type="checkbox" style={{ cursor: 'pointer' }} />
                                </th>
                                <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LR Number</th>
                                <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</th>
                                <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Route</th>
                                <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Freight</th>
                                <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>POD</th>
                                <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Truck Payment</th>
                                <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map(record => (
                                <tr
                                    key={record.id}
                                    style={{
                                        borderBottom: '1px solid var(--admin-border)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--admin-bg)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = selectedRecord?.id === record.id ? 'var(--admin-bg)' : 'transparent'}
                                    onClick={() => setSelectedRecord(record)}
                                >
                                    <td style={{ padding: '1rem 0.75rem' }} onClick={e => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(record.id)}
                                            onChange={() => toggleSelection(record.id)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </td>
                                    <td style={{ padding: '1rem 0.75rem' }}>
                                        <div style={{ fontWeight: '700', color: 'var(--admin-primary)', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                                            {record.mainLR}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginTop: '0.25rem' }}>
                                            {record.mainLRDate}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 0.75rem' }}>
                                        <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{record.clientName}</div>
                                    </td>
                                    <td style={{ padding: '1rem 0.75rem' }}>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--admin-text)' }}>{record.route}</div>
                                    </td>
                                    <td style={{ padding: '1rem 0.75rem' }}>
                                        <div style={{ fontWeight: '600', fontFamily: 'monospace' }}>₹{(record.totalFreight || 0).toLocaleString()}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', textTransform: 'uppercase' }}>{record.paymentMode || 'Paid'}</div>
                                    </td>
                                    <td style={{ padding: '1rem 0.75rem' }}>
                                        <span className={`admin-badge ${record.podStatus === 'Uploaded' ? 'badge-success' : 'badge-warning'}`}>
                                            {record.podStatus}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 0.75rem' }}>
                                        <div style={{ fontWeight: '600', fontFamily: 'monospace', color: 'var(--admin-success)' }}>
                                            ₹{record.totalTruckPaid.toLocaleString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                                        <button
                                            className="admin-btn admin-btn-outline"
                                            style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedRecord(record);
                                            }}
                                        >
                                            <Eye size={14} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredRecords.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-light)' }}>
                            No records found matching your criteria.
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Panel Modal */}
            {selectedRecord && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '600px',
                    maxWidth: '90vw',
                    background: 'white',
                    boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    {/* Panel Header */}
                    <div style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid var(--admin-border)',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'monospace', marginBottom: '0.25rem' }}>
                                    LR #{selectedRecord.mainLR}
                                </h2>
                                <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Master Record • Auto-Linked to Trip</p>
                            </div>
                            <button
                                onClick={() => setSelectedRecord(null)}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    padding: '0.5rem',
                                    cursor: 'pointer',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Panel Content */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>

                        {/* 1. View-Only Trip Data */}
                        <section style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileText size={14} /> Operational Data (Read-Only)
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--admin-bg)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--admin-border)' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', display: 'block', marginBottom: '0.25rem' }}>Client</label>
                                    <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{selectedRecord.clientName}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', display: 'block', marginBottom: '0.25rem' }}>Order Date</label>
                                    <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{selectedRecord.orderDate}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', display: 'block', marginBottom: '0.25rem' }}>Consignor</label>
                                    <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{selectedRecord.consignor?.name || '-'}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', display: 'block', marginBottom: '0.25rem' }}>Consignee</label>
                                    <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{selectedRecord.consignments?.[0]?.consignee || '-'}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', display: 'block', marginBottom: '0.25rem' }}>Truck</label>
                                    <div style={{ fontWeight: '500', fontSize: '0.875rem', fontFamily: 'monospace' }}>{selectedRecord.vehicleNo || 'Unassigned'}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', display: 'block', marginBottom: '0.25rem' }}>Driver</label>
                                    <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{selectedRecord.driverName || '-'}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', display: 'block', marginBottom: '0.25rem' }}>Freight Type</label>
                                    <span className="admin-badge badge-info" style={{ fontSize: '0.7rem' }}>
                                        {selectedRecord.paymentMode || 'Paid'}
                                    </span>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', display: 'block', marginBottom: '0.25rem' }}>Client Freight</label>
                                    <div style={{ fontWeight: '600', fontSize: '0.875rem', fontFamily: 'monospace' }}>₹{(selectedRecord.totalFreight || 0).toLocaleString()}</div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Documents Section */}
                        <section style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Upload size={14} /> Transport Documents
                                </h3>
                                <button
                                    onClick={() => setIsUploadModalOpen(true)}
                                    className="admin-btn admin-btn-primary"
                                    style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                                >
                                    <Upload size={12} /> Upload
                                </button>
                            </div>

                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {(!selectedRecord.documents || selectedRecord.documents.length === 0) && (
                                    <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed var(--admin-border)', borderRadius: '0.5rem', color: 'var(--admin-text-light)', fontSize: '0.875rem' }}>
                                        No documents uploaded yet.
                                    </div>
                                )}
                                {selectedRecord.documents?.map((doc, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'white', border: '1px solid var(--admin-border)', borderRadius: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                padding: '0.5rem',
                                                borderRadius: '0.5rem',
                                                background: doc.type === 'POD' ? '#d1fae5' : '#dbeafe',
                                                color: doc.type === 'POD' ? '#065f46' : '#1e40af'
                                            }}>
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{doc.type}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)' }}>{doc.date} • {doc.uploadedBy}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                style={{ padding: '0.375rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--admin-accent)' }}
                                                onClick={() => window.open(doc.url)}
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                style={{ padding: '0.375rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--admin-danger)' }}
                                                onClick={() => {
                                                    if (window.confirm('Delete this document?')) deleteDocument(selectedRecord.id, idx);
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 3. Truck Payment Section */}
                        <section>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CreditCard size={14} /> Truck Payment & Settlements
                                </h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => setIsExpenseModalOpen(true)}
                                        className="admin-btn admin-btn-outline"
                                        style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                                    >
                                        + Expense
                                    </button>
                                    <button
                                        onClick={() => handleOpenPaymentModal()}
                                        className="admin-btn admin-btn-primary"
                                        style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', background: 'var(--admin-success)' }}
                                    >
                                        <CreditCard size={12} /> Record
                                    </button>
                                </div>
                            </div>

                            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white', padding: '1.25rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Lorry Hire</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'monospace' }}>₹{(selectedRecord.truckHire || 0).toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Advances Paid</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'monospace', color: '#fbbf24' }}>₹{(selectedRecord.truckAdvancePaid || 0).toLocaleString()}</div>
                                        <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '0.25rem' }}>
                                            (Amount transferred)
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expenses (+)</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'monospace', color: '#f87171' }}>₹{(selectedRecord.truckTotalExpenses || 0).toLocaleString()}</div>
                                        <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '0.25rem' }}>
                                            (Deducted before transfer)
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance Pending</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'monospace', color: '#10b981' }}>₹{(selectedRecord.truckBalance || selectedRecord.truckHire || 0).toLocaleString()}</div>
                                        <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '0.25rem' }}>
                                            (Hire - Advances - Expenses)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {(!selectedRecord.truckPaymentHistory || selectedRecord.truckPaymentHistory.length === 0) && (
                                    <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--admin-bg)', borderRadius: '0.5rem', color: 'var(--admin-text-light)', fontSize: '0.875rem' }}>
                                        {!selectedRecord.truckHire ? (
                                            <>
                                                <div style={{ marginBottom: '0.5rem', fontWeight: '500', color: 'var(--admin-text)' }}>No truck hire set yet</div>
                                                <div>Click "Record" to set total lorry hire and record first advance payment</div>
                                            </>
                                        ) : (
                                            'No payment records found.'
                                        )}
                                    </div>
                                )}
                                {selectedRecord.truckPaymentHistory?.map((pay, idx) => (
                                    <div key={idx} style={{ padding: '0.75rem', background: 'white', border: '1px solid var(--admin-border)', borderRadius: '0.5rem', position: 'relative' }}>
                                        {/* Edit Button */}
                                        <button
                                            onClick={() => handleOpenPaymentModal(pay)}
                                            style={{
                                                position: 'absolute',
                                                top: '0.75rem',
                                                right: '0.75rem',
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
                                            title="Edit Payment"
                                        >
                                            <Edit size={14} />
                                        </button>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem', paddingRight: '2rem' }}>
                                            <div>
                                                <span className={`admin-badge ${pay.type === 'Advance' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                                                    {pay.type}
                                                </span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', marginLeft: '0.5rem' }}>{pay.date}</span>
                                            </div>
                                            <div style={{ fontWeight: '700', fontFamily: 'monospace', fontSize: '0.95rem' }}>₹{parseFloat(pay.amount).toLocaleString()}</div>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text)', marginBottom: '0.25rem' }}>
                                            Paid to: <span style={{ fontWeight: '500' }}>{pay.paidTo}</span>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{pay.bankAccount}</span>
                                            <span style={{ fontFamily: 'monospace' }}>Ref: {pay.reference}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {isUploadModalOpen && (
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
                    <div className="admin-card" style={{ width: '100%', maxWidth: '500px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Upload Document</h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Document Type</label>
                            <select
                                style={{
                                    width: '100%',
                                    padding: '0.625rem',
                                    border: '1px solid var(--admin-border)',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem'
                                }}
                                value={uploadDocType}
                                onChange={(e) => setUploadDocType(e.target.value)}
                            >
                                {allowedDocTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div style={{
                            border: '2px dashed var(--admin-border)',
                            borderRadius: '0.5rem',
                            padding: '2rem',
                            textAlign: 'center',
                            marginBottom: '1.5rem',
                            cursor: 'pointer',
                            background: 'var(--admin-bg)'
                        }}>
                            <Upload size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--admin-text-light)' }} />
                            <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-light)' }}>Click to Select File</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginTop: '0.25rem' }}>PDF, JPG, PNG (Max 10MB)</div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsUploadModalOpen(false)} className="admin-btn admin-btn-outline">Cancel</button>
                            <button onClick={handleDocumentUpload} className="admin-btn admin-btn-primary">Upload</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {isPaymentModalOpen && (
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
                    <div className="admin-card" style={{ width: '100%', maxWidth: '500px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                            {editingPayment ? 'Edit Truck Payment' : 'Record Truck Payment'}
                        </h3>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {/* Truck Hire - Only show if not already set */}
                            {(!selectedRecord.truckHire || selectedRecord.truckHire === 0) && (
                                <div style={{ background: 'var(--admin-bg)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--admin-border)' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                        Total Lorry Hire (₹) <span style={{ color: 'var(--admin-danger)' }}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem',
                                            border: '1px solid var(--admin-border)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            fontFamily: 'monospace',
                                            fontWeight: '600'
                                        }}
                                        placeholder="Enter total truck hire amount"
                                        value={paymentForm.truckHire}
                                        onChange={e => setPaymentForm({ ...paymentForm, truckHire: e.target.value })}
                                    />
                                    <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', marginTop: '0.25rem' }}>
                                        Set this once for the LR. Future payments will calculate balance automatically.
                                    </div>
                                </div>
                            )}

                            {/* Show current truck hire and balance if already set */}
                            {selectedRecord.truckHire && selectedRecord.truckHire > 0 && (
                                <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white', padding: '1rem', borderRadius: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.25rem' }}>Total Hire</div>
                                        <div style={{ fontWeight: '700', fontFamily: 'monospace' }}>₹{selectedRecord.truckHire.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.25rem' }}>Paid</div>
                                        <div style={{ fontWeight: '700', fontFamily: 'monospace', color: '#fbbf24' }}>₹{(selectedRecord.truckAdvancePaid || 0).toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.25rem' }}>Balance</div>
                                        <div style={{ fontWeight: '700', fontFamily: 'monospace', color: '#10b981' }}>₹{(selectedRecord.truckBalance || selectedRecord.truckHire || 0).toLocaleString()}</div>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Date</label>
                                    <input
                                        type="date"
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem',
                                            border: '1px solid var(--admin-border)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                        value={paymentForm.date}
                                        onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Type</label>
                                    <select
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem',
                                            border: '1px solid var(--admin-border)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                        value={paymentForm.type}
                                        onChange={e => setPaymentForm({ ...paymentForm, type: e.target.value })}
                                    >
                                        <option value="Advance">Advance</option>
                                        <option value="Balance">Balance</option>
                                        <option value="Full Settlement">Full Settlement</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Amount (₹)</label>
                                <input
                                    type="number"
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem',
                                        border: '1px solid var(--admin-border)',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontFamily: 'monospace'
                                    }}
                                    placeholder="0.00"
                                    value={paymentForm.amount}
                                    onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Paid To</label>
                                <input
                                    list="brokers-list"
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem',
                                        border: '1px solid var(--admin-border)',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem'
                                    }}
                                    placeholder="Select or type broker name"
                                    value={paymentForm.paidTo}
                                    onChange={e => setPaymentForm({ ...paymentForm, paidTo: e.target.value })}
                                />
                                <datalist id="brokers-list">
                                    {brokers.map(broker => (
                                        <option key={broker.id} value={broker.name} />
                                    ))}
                                </datalist>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Bank Account</label>
                                <select
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem',
                                        border: '1px solid var(--admin-border)',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem'
                                    }}
                                    value={paymentForm.bankAccount}
                                    onChange={e => setPaymentForm({ ...paymentForm, bankAccount: e.target.value })}
                                >
                                    {bankAccounts.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Payment Ref / UTR</label>
                                <input
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem',
                                        border: '1px solid var(--admin-border)',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem'
                                    }}
                                    placeholder="Enter Reference Number"
                                    value={paymentForm.reference}
                                    onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                                />
                            </div>

                            <div style={{
                                padding: '1rem',
                                background: 'var(--admin-bg)',
                                border: '1px solid var(--admin-border)',
                                borderRadius: '0.5rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                color: 'var(--admin-accent)',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}>
                                <Upload size={14} /> Upload Proof Screenshot (Optional)
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="admin-btn admin-btn-outline">Cancel</button>
                            <button onClick={handleRecordPayment} className="admin-btn admin-btn-primary" style={{ background: 'var(--admin-success)' }}>
                                {editingPayment ? 'Update Payment' : 'Record Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Expense Modal */}
            {isExpenseModalOpen && (
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
                    <div className="admin-card" style={{ width: '100%', maxWidth: '450px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                            Record Truck Expense
                        </h3>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                    Expense Type <span style={{ color: 'var(--admin-danger)' }}>*</span>
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
                                    placeholder="e.g., Toll, Detention, Loading/Unloading"
                                    value={expenseForm.type}
                                    onChange={e => setExpenseForm({ ...expenseForm, type: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                        Amount (₹) <span style={{ color: 'var(--admin-danger)' }}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem',
                                            border: '1px solid var(--admin-border)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            fontFamily: 'monospace',
                                            fontWeight: '600'
                                        }}
                                        placeholder="0.00"
                                        value={expenseForm.amount}
                                        onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Date</label>
                                    <input
                                        type="date"
                                        style={{
                                            width: '100%',
                                            padding: '0.625rem',
                                            border: '1px solid var(--admin-border)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                        value={expenseForm.date}
                                        onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Notes (Optional)</label>
                                <textarea
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem',
                                        border: '1px solid var(--admin-border)',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        resize: 'vertical',
                                        minHeight: '60px'
                                    }}
                                    placeholder="Additional details..."
                                    value={expenseForm.notes}
                                    onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                                />
                            </div>

                            <div style={{ background: 'var(--admin-bg)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>
                                <strong>Note:</strong> Expenses are deductions made during advance payment (e.g., toll, detention). They are added to total paid amount.
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button onClick={() => setIsExpenseModalOpen(false)} className="admin-btn admin-btn-outline">Cancel</button>
                            <button onClick={handleRecordExpense} className="admin-btn admin-btn-primary" style={{ background: 'var(--admin-danger)' }}>
                                Record Expense
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default MasterRecord;
