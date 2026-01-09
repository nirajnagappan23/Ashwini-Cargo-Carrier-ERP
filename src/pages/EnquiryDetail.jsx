import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Truck, MapPin, Package, MessageSquare, CheckCircle, XCircle, ArrowLeft, Clock } from 'lucide-react';

const EnquiryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { enquiries, updateEnquiryStatus, chats } = useApp();

    const enquiry = enquiries.find(e => e.id === id);

    if (!enquiry) return <div className="p-8 text-center">Enquiry not found</div>;

    const handleNegotiate = () => {
        // Find chat for this enquiry
        const chat = chats.find(c => c.enquiryId === enquiry.id);
        navigate('/chat', { state: { chatId: chat ? chat.id : null } });
    };

    const handleAction = (status) => {
        // If accepted, mock convert to trip logic or just updates status
        updateEnquiryStatus(enquiry.id, status);
    };

    return (
        <div className="container animate-fade-in pb-20">
            <header className="mb-6 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-primary">{enquiry.clientRef || enquiry.id}</h1>
                    <div className="flex items-center gap-2">
                        <span className="text-secondary text-xs bg-slate-100 px-2 py-0.5 rounded">ID: {enquiry.id}</span>
                        <span className="text-secondary text-sm">{enquiry.route}</span>
                    </div>
                </div>
                <div className={`ml-auto px-3 py-1 rounded text-sm font-semibold ${enquiry.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                    enquiry.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-blue-50 text-blue-700'
                    }`}>
                    {enquiry.status}
                </div>
            </header>

            {/* Quote Section */}
            {enquiry.status === 'Quoted' && (
                <div className="card p-6 mb-6 border-l-4 border-l-blue-500 bg-blue-50/50">
                    <h3 className="text-lg font-semibold text-primary mb-2">Admin Quote Received</h3>
                    <div className="text-3xl font-bold text-accent mb-4">₹ {enquiry.quoteAmount?.toLocaleString()}</div>

                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => handleAction('Confirmed')}
                            className="btn btn-primary flex-1 bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircle size={18} /> Accept Quote
                        </button>
                        <button
                            onClick={() => handleNegotiate()}
                            className="btn bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 flex-1"
                        >
                            <MessageSquare size={18} /> Negotiate
                        </button>
                        <button
                            onClick={() => handleAction('Rejected')}
                            className="btn bg-white border border-red-200 text-red-600 hover:bg-red-50 flex-1"
                        >
                            <XCircle size={18} /> Reject
                        </button>
                    </div>
                </div>
            )}

            {enquiry.status === 'Requested' && (
                <div className="card p-6 mb-6 flex flex-col items-center justify-center text-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                        <Clock size={24} />
                    </div>
                    <h3 className="font-medium">Waiting for Quote</h3>
                    <p className="text-sm text-secondary">Ashwini Admin will review and provide a rate shortly.</p>
                    <button className="btn btn-outline mt-2" onClick={handleNegotiate}>
                        Chat with Admin
                    </button>
                    <button className="btn btn-outline text-slate-500 mt-2 text-xs border-0 underline">
                        Modify Enquiry
                    </button>
                </div>
            )}

            <div className="space-y-6">
                {/* Route Info */}
                <section className="card p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <MapPin size={18} className="text-accent" /> Route Details
                    </h3>
                    {/* Logic to show pickups/drops if array exists, else generic mock */}
                    <div className="space-y-4 relative">
                        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200"></div>

                        {enquiry.pickups ? enquiry.pickups.map((p, i) => (
                            <div key={i} className="flex gap-4 relative">
                                <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center z-10">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">{p.city}</div>
                                    <div className="text-xs text-secondary">{p.address || 'No address'}</div>
                                </div>
                            </div>
                        )) : (
                            <div className="flex gap-4 relative">
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center z-10 text-[10px] text-green-700 font-bold">A</div>
                                <div>
                                    <div className="text-sm font-semibold">Origin</div>
                                </div>
                            </div>
                        )}

                        {enquiry.drops ? enquiry.drops.map((d, i) => (
                            <div key={i} className="flex gap-4 relative">
                                <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center z-10">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">{d.city}</div>
                                    <div className="text-xs text-secondary">{d.address || 'No address'}</div>
                                </div>
                            </div>
                        )) : (
                            <div className="flex gap-4 relative">
                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center z-10 text-[10px] text-red-700 font-bold">B</div>
                                <div>
                                    <div className="text-sm font-semibold">Destination</div>
                                </div>
                            </div>
                        )}

                    </div>
                </section>

                {/* Material Info */}
                <section className="card p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Package size={18} className="text-accent" /> Material
                    </h3>
                    {enquiry.materials && enquiry.materials.map((m, i) => (
                        <div key={i} className="mb-3 p-3 bg-slate-50 rounded border border-slate-100">
                            <div className="font-medium text-primary">{m.type || m.nickname}</div>
                            <div className="text-sm text-secondary mt-1">
                                {m.weight} {m.weightUnit} • {m.packingType || 'Loose'}
                            </div>
                            {(m.length || m.quantity) && (
                                <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-200">
                                    {m.quantity && <span>Qty: {m.quantity} </span>}
                                    {m.length && <span>Dims: {m.length}x{m.width}x{m.height} {m.dimUnit}</span>}
                                </div>
                            )}
                        </div>
                    ))}
                </section>

                {/* Truck Info */}
                {enquiry.loadType === 'FTL' && enquiry.requestedTrucks && enquiry.requestedTrucks.length > 0 && (
                    <section className="card p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Truck size={18} className="text-accent" /> Requested Trucks
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                            {enquiry.requestedTrucks.map(t => (
                                <span key={t} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">{t}</span>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
};

export default EnquiryDetail;
