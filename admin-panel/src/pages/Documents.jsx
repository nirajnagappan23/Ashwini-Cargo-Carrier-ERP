import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { FileText, Download, Upload, Eye, Plus, ChevronDown, ChevronUp, Search, Filter, Trash2 } from 'lucide-react';

const Documents = () => {
    const { orders, addDocument, deleteDocument } = useAdmin(); // Added deleteDocument
    const [expandedTrip, setExpandedTrip] = useState(null);
    const [customDocName, setCustomDocName] = useState('');
    const [selectedUploadCategory, setSelectedUploadCategory] = useState('E-Way Bill');
    const [uploadingFor, setUploadingFor] = useState(null);
    const [clientFilter, setClientFilter] = useState('');

    const clientDocTypes = [
        'E-Way Bill', 'Material Invoice', 'Material Insurance', 'Packing List', 'Delivery Challan', 'Other (Custom)'
    ];

    const adminDocTypes = [
        'LR Copy', 'Freight Bill', 'POD', 'Payment Receipt', 'Other (Custom)'
    ];

    // Get Documents Data from Order or Return Empty
    const getDocumentsForEnquiry = (enquiryId) => {
        const order = orders.find(o => o.id === enquiryId);
        return order?.documents || [];
    };

    const toggleExpand = (id) => {
        setExpandedTrip(expandedTrip === id ? null : id);
    };

    const handleUploadClick = (e, enquiryId) => {
        e.stopPropagation();
        setUploadingFor(enquiryId);
    };

    const handleUploadSubmit = () => {
        if (selectedUploadCategory === 'Other (Custom)' && !customDocName.trim()) {
            alert("Please enter a name for the custom document.");
            return;
        }

        const docName = selectedUploadCategory === 'Other (Custom)' ? customDocName : selectedUploadCategory;
        // Determine type based on category list (loose check)
        const isClientDoc = clientDocTypes.includes(selectedUploadCategory) && selectedUploadCategory !== 'Other (Custom)'; // Simple logic, can be improved

        // Actually, let's just categorize by who uploaded it. If the Admin uploads it, it's generally an Admin provided doc, 
        // unless they are explicitly uploading a "Client Document" on behalf of the client.
        // For now, let's keep it simple: everything uploaded here is "Admin" managed, but we label it by its type.

        addDocument(uploadingFor, {
            name: docName,
            type: selectedUploadCategory,
            uploadedBy: 'Admin',
            url: '#'
        });

        alert(`Uploaded: ${docName}`);

        // Reset
        setUploadingFor(null);
        setCustomDocName('');
        setSelectedUploadCategory('E-Way Bill');
    };

    const filteredOrders = orders.filter(order =>
        clientFilter === '' || order.clientName === clientFilter
    );

    const distinctClients = [...new Set(orders.map(o => o.clientName).filter(Boolean))];

    return (
        <div className="pb-20">
            <div className="admin-header">
                <div>
                    <h1>Documents</h1>
                    <p>Manage all shipment documents & receipts</p>
                </div>
                <div style={{ position: 'relative', width: '250px' }}>
                    <Filter size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-light)' }} />
                    <select
                        style={{
                            width: '100%',
                            padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                            border: '1px solid var(--admin-border)',
                            borderRadius: '0.5rem',
                            appearance: 'none',
                            fontSize: '0.875rem'
                        }}
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

            <div style={{ display: 'grid', gap: '1rem' }}>
                {filteredOrders.map(enq => {
                    const docs = getDocumentsForEnquiry(enq.id);
                    return (
                        <div key={enq.id} className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
                            {/* Header */}
                            <div
                                style={{ padding: '1rem', background: 'var(--admin-bg)', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                onClick={() => toggleExpand(enq.id)}
                            >
                                <div>
                                    <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {enq.orderId || enq.id}
                                        {enq.lrNumber && <span className="admin-badge badge-success">LR: {enq.lrNumber}</span>}
                                        {((!enq.lrNumber) && enq.consignments?.[0]?.lrNumber) && <span className="admin-badge badge-success">LR: {enq.consignments[0].lrNumber}</span>}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-light)', marginTop: '0.25rem' }}>
                                        Ref: {enq.clientRef} • {enq.clientName} • {enq.status}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <button
                                        className="admin-btn admin-btn-primary"
                                        onClick={(e) => handleUploadClick(e, enq.id)}
                                        style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                                    >
                                        <Upload size={14} /> Upload
                                    </button>
                                    {expandedTrip === enq.id ? <ChevronUp size={20} color="var(--admin-text-light)" /> : <ChevronDown size={20} color="var(--admin-text-light)" />}
                                </div>
                            </div>

                            {/* Expandable Content */}
                            {expandedTrip === enq.id && (
                                <div style={{ padding: '1.5rem', background: 'white' }}>
                                    {/* Upload Section */}
                                    {uploadingFor === enq.id && (
                                        <div style={{ padding: '1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e40af' }}>Upload New Document</h4>
                                                <button onClick={() => setUploadingFor(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}>×</button>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', marginBottom: '0.25rem' }}>Document Type</label>
                                                    <select
                                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                                                        value={selectedUploadCategory}
                                                        onChange={(e) => setSelectedUploadCategory(e.target.value)}
                                                    >
                                                        <optgroup label="Client Documents">
                                                            {clientDocTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                                        </optgroup>
                                                        <optgroup label="Transport/Admin Documents">
                                                            {adminDocTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                                        </optgroup>
                                                    </select>
                                                </div>
                                                {selectedUploadCategory === 'Other (Custom)' && (
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', marginBottom: '0.25rem' }}>Document Name</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. Special Permit"
                                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                                                            value={customDocName}
                                                            onChange={(e) => setCustomDocName(e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <button
                                                    className="admin-btn admin-btn-outline"
                                                    onClick={() => setUploadingFor(null)}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className="admin-btn admin-btn-primary"
                                                    onClick={handleUploadSubmit}
                                                >
                                                    Upload File
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--admin-text-light)', textTransform: 'uppercase', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>Uploaded Documents</h4>

                                        {docs.length === 0 ? (
                                            <div className="text-sm text-slate-400 italic">No documents uploaded yet.</div>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                                {docs.map((doc, idx) => (
                                                    <div key={idx} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                                                            <FileText size={20} color={doc.type.includes('Custom') ? '#f59e0b' : '#3b82f6'} />
                                                            <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">{doc.date}</span>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>{doc.name}</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{doc.type}</div>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #cbd5e1' }}>
                                                            <button className="text-xs text-blue-600 hover:text-blue-800 font-medium" onClick={() => window.open(doc.url, "_blank")}>View</button>
                                                            <button className="text-red-400 hover:text-red-600" onClick={() => { if (window.confirm('Delete document?')) deleteDocument(enq.id, idx); }}><Trash2 size={12} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}

                {filteredOrders.length === 0 && (
                    <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-light)' }}>
                        No orders found for the selected filter.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Documents;
