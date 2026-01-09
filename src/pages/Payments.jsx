import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CreditCard, FileText, Upload, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Payments = () => {
    const { enquiries } = useApp();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');

    // Get confirmed trips with financial details
    const paymentTrips = enquiries.filter(e => e.status === 'Confirmed');

    const getStatusColor = (status) => {
        if (status === 'Paid') return 'bg-green-100 text-green-700';
        if (status === 'To Pay' || status === 'To Be Billed') return 'bg-yellow-100 text-yellow-700';
        return 'bg-slate-100 text-slate-700';
    };

    // Helper to simulate document existence (since we don't have a real backend)
    // In a real app, we check if specific doc types exist in the 'documents' array of the trip.
    // For now, we mock it based on trip status or random.
    const hasDoc = (trip, type) => {
        // Mock logic: if we have consignments, assume docs exist for demo
        return trip.consignments && trip.consignments.length > 0;
    };

    const handleUploadClick = (tripId, docType) => {
        // In a real app, this would open an upload modal that targets THIS specific doc type
        // and upon success, updates the central document store.
        navigate('/documents'); // Redirect to central docs for now
    };

    return (
        <div className="container animate-fade-in pb-20">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-primary">Payments</h1>
                <p className="text-secondary">Track freight pills, receipts & LR values</p>
            </header>

            {/* Simple Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['All', 'Paid', 'To Pay', 'To Be Billed'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors
                            ${filter === f ? 'bg-primary text-white border-primary' : 'bg-white text-secondary border-slate-200 hover:border-primary'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {paymentTrips.filter(t => filter === 'All' || t.paymentMode === filter).map(trip => (
                    <div key={trip.id} className="card p-0 border border-slate-200 overflow-hidden">
                        {/* Header */}
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
                            <div>
                                <div className="font-bold text-primary">{trip.clientRef || trip.id}</div>
                                <div className="text-xs text-secondary list-disc list-inside flex gap-4">
                                    <span>{trip.orderDate}</span>
                                    <span>{(trip.consignments || []).length} LRs</span>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded text-xs font-bold ${getStatusColor(trip.paymentMode)}`}>
                                {trip.paymentMode}
                            </div>
                        </div>

                        {/* Financials Row */}
                        <div className="p-4 grid grid-cols-3 gap-4 border-b border-slate-100 bg-white">
                            <div>
                                <div className="text-[10px] text-secondary uppercase font-bold">Total Freight</div>
                                <div className="font-semibold text-primary">₹ {trip.totalFreight?.toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-secondary uppercase font-bold">Advance</div>
                                <div className="font-semibold text-green-600">₹ {trip.advance?.toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-secondary uppercase font-bold">Balance</div>
                                <div className="font-semibold text-red-600">₹ {trip.balance?.toLocaleString()}</div>
                            </div>
                        </div>

                        {/* LR & Document Details */}
                        <div className="p-4 bg-white space-y-4">
                            {(trip.consignments || []).map((lr, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                                    {/* LR Info */}
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded">
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-primary">{lr.lrNumber}</div>
                                            <div className="text-xs text-secondary">Value: ₹ {(trip.totalFreight / (trip.consignments.length || 1)).toLocaleString()} (Approx)</div>
                                        </div>
                                    </div>

                                    {/* Document Status Icons - View Only for Client */}
                                    <div className="flex gap-4">
                                        {/* LR Copy */}
                                        <div className="text-center group cursor-pointer" onClick={() => handleUploadClick(trip.id, 'LR')}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 
                                                ${hasDoc(trip, 'LR') ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-300'}`}>
                                                {hasDoc(trip, 'LR') ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                            </div>
                                            <div className="text-[10px] text-secondary">LR Copy</div>
                                        </div>

                                        {/* Freight Bill */}
                                        <div className="text-center group cursor-pointer" onClick={() => handleUploadClick(trip.id, 'Bill')}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 
                                                ${hasDoc(trip, 'Bill') ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-300'}`}>
                                                {hasDoc(trip, 'Bill') ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                            </div>
                                            <div className="text-[10px] text-secondary">Freight Bill</div>
                                        </div>

                                        {/* Payment Receipt */}
                                        <div className="text-center group cursor-pointer" onClick={() => handleUploadClick(trip.id, 'Receipt')}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 
                                                ${trip.paymentMode === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-300'}`}>
                                                {trip.paymentMode === 'Paid' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                            </div>
                                            <div className="text-[10px] text-secondary">Receipt</div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Removed Manage Documents CTA for Client View Only */}
                        </div>
                    </div>
                ))}

                {paymentTrips.length === 0 && (
                    <div className="text-center py-10 text-secondary">
                        <CreditCard size={48} className="mx-auto text-slate-200 mb-4" />
                        <p>No active payment records found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payments;
