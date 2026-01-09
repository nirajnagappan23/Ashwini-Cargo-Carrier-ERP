import React, { useState } from 'react';
import { FileText, Download, Upload, Eye, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Documents = () => {
    const { enquiries } = useApp();
    const [expandedTrip, setExpandedTrip] = useState(null);
    const [customDocName, setCustomDocName] = useState('');
    const [selectedUploadCategory, setSelectedUploadCategory] = useState('E-Way Bill');
    const [uploadingFor, setUploadingFor] = useState(null); // Trip ID being uploaded for

    // Mock Documents Data mapped to Enquiries
    // In a real app, this would be fetched from backend based on enquiry ID
    const getDocumentsForEnquiry = (enquiryId) => {
        // returning mock data mixed with static structure
        return [
            { name: 'E-Way Bill', type: 'Client', date: '2025-01-02', url: '#' },
            { name: 'LR Copy', type: 'Admin', date: '2025-01-03', url: '#' },
        ];
    };

    const clientDocTypes = [
        'E-Way Bill', 'Material Invoice', 'Material Insurance', 'Packing List', 'Delivery Challan', 'Other (Custom)'
    ];

    const adminDocTypes = [
        'LR Copy', 'Freight Bill', 'POD', 'Payment Receipt'
    ];

    const toggleExpand = (id) => {
        setExpandedTrip(expandedTrip === id ? null : id);
    };

    const handleUploadClick = (e, enquiryId) => {
        e.stopPropagation();
        setUploadingFor(enquiryId);
    };

    const handleUploadSubmit = () => {
        alert(`Uploading ${selectedUploadCategory === 'Otner (Custom)' ? customDocName : selectedUploadCategory} for ${uploadingFor}`);
        setUploadingFor(null);
        setCustomDocName('');
        setSelectedUploadCategory('E-Way Bill');
    };

    return (
        <div className="container animate-fade-in pb-20">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-primary">Documents</h1>
                <p className="text-secondary">Manage trip & consignment documentation</p>
            </header>

            <div className="space-y-6">
                {enquiries.map(enq => (
                    <div key={enq.id} className="card p-0 overflow-hidden border border-slate-200">
                        {/* Header / Trip Title */}
                        <div
                            className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                            onClick={() => toggleExpand(enq.id)}
                        >
                            <div>
                                <div className="font-bold text-primary flex items-center gap-2">
                                    {enq.clientRef || enq.id}
                                    {enq.lrNumber && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">LR: {enq.lrNumber}</span>}
                                </div>
                                <div className="text-xs text-secondary mt-1">
                                    {enq.route} • {enq.status}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    className="btn btn-sm btn-primary flex gap-1 items-center z-10"
                                    onClick={(e) => handleUploadClick(e, enq.id)}
                                >
                                    <Upload size={14} /> <span className="hidden sm:inline">Upload</span>
                                </button>
                                {expandedTrip === enq.id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                            </div>
                        </div>

                        {/* Expandable Content */}
                        {expandedTrip === enq.id && (
                            <div className="p-4 bg-white animate-fade-in">

                                {/* Upload Section (Conditional) */}
                                {uploadingFor === enq.id && (
                                    <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-sm font-bold text-primary">Upload New Document</h4>
                                            <button onClick={() => setUploadingFor(null)} className="text-secondary hover:text-red-500">×</button>
                                        </div>
                                        <div className="grid-2 gap-4">
                                            <div className="input-group">
                                                <label className="label">Document Type</label>
                                                <select
                                                    className="select"
                                                    value={selectedUploadCategory}
                                                    onChange={(e) => setSelectedUploadCategory(e.target.value)}
                                                >
                                                    {clientDocTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                                </select>
                                            </div>
                                            {selectedUploadCategory === 'Other (Custom)' && (
                                                <div className="input-group">
                                                    <label className="label">Document Name</label>
                                                    <input
                                                        className="input"
                                                        placeholder="e.g. Special Permit"
                                                        value={customDocName}
                                                        onChange={(e) => setCustomDocName(e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-4 flex justify-end gap-2">
                                            <button className="btn btn-outline text-xs px-4" onClick={() => setUploadingFor(null)}>Cancel</button>
                                            <button className="btn btn-primary text-xs px-4" onClick={handleUploadSubmit}>Upload File</button>
                                        </div>
                                    </div>
                                )}

                                {/* Document Lists */}
                                <div className="grid gap-6 md:grid-cols-2">

                                    {/* Client Documents */}
                                    <div>
                                        <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 pb-1 border-b">Client Uploads</h4>
                                        <div className="space-y-2">
                                            {getDocumentsForEnquiry(enq.id).filter(d => d.type === 'Client').map((doc, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100 group transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <FileText size={16} className="text-blue-500" />
                                                        <div>
                                                            <div className="text-sm font-medium text-primary">{doc.name}</div>
                                                            <div className="text-[10px] text-secondary">{doc.date}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-1.5 hover:bg-blue-100 text-blue-600 rounded" title="View"><Eye size={14} /></button>
                                                        <button className="p-1.5 hover:bg-green-100 text-green-600 rounded" title="Download"><Download size={14} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={(e) => handleUploadClick(e, enq.id)}
                                                className="w-full py-2 border border-dashed border-slate-200 rounded text-xs text-secondary hover:text-primary hover:border-blue-300 flex items-center justify-center gap-1 transition-colors"
                                            >
                                                <Plus size={12} /> Add Client Document
                                            </button>
                                        </div>
                                    </div>

                                    {/* Admin Documents */}
                                    <div>
                                        <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 pb-1 border-b">Admin / Trip Docs</h4>
                                        <div className="space-y-2">
                                            {/* Mock Admin Docs for this view */}
                                            {adminDocTypes.map((name, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100 group transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <FileText size={16} className="text-purple-500" />
                                                        <div>
                                                            <div className="text-sm font-medium text-primary">{name}</div>
                                                            <div className="text-[10px] text-secondary">Pending Upload</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[10px] text-slate-400 italic px-2">Not yet available</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {enquiries.length === 0 && (
                    <div className="text-center py-10 text-secondary">
                        <p>No active enquiries or trips found.</p>
                        <p className="text-sm">Book a truck to manage documents.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Documents;
