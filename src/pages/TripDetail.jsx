import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Phone, Truck, CreditCard, CheckCircle, Circle, MapPin, Clock, FileText, Upload, X, Eye, Package, TrendingUp, Database, Users, Trash2 } from 'lucide-react';
import ImageLightbox from '../components/ImageLightbox';

const TripDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { enquiries, addDocument } = useApp();

    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [docType, setDocType] = useState('Payment Reference');
    const [customName, setCustomName] = useState('');

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    let trip = enquiries.find(e => e.id === id);

    // Mock Backend: Read from LocalStorage if available (to sync with Admin uploads in local demo)
    try {
        const saved = localStorage.getItem(`MOCK_TRIP_${id}`);
        if (saved) {
            trip = { ...trip, ...JSON.parse(saved) };
        }
    } catch (e) { console.error("Error reading mock data", e); }
    const driverPhotos = trip?.driverPhotos || [];
    const loadingPhotos = trip?.loadingPhotos || [];
    const unloadingPhotos = trip?.unloadingPhotos || [];

    const openLightbox = (images, index) => {
        setLightboxImages(images);
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const handleUploadEntry = () => {
        const finalName = docType === 'Other Document' ? customName : docType;
        const finalType = docType === 'Other Document' ? 'Custom' : docType;

        if (docType === 'Other Document' && !customName.trim()) {
            alert("Please enter document name");
            return;
        }

        addDocument(id, {
            name: finalName,
            type: finalType,
            uploadedBy: 'Client',
            url: '#'
        });
        setUploadModalOpen(false);
        setCustomName('');
        alert("Document Uploaded Successfully");
    };

    if (!trip) return <div className="p-8 text-center">Trip not found</div>;

    const timeline = trip.trackingHistory || [];
    const currentStepIndex = timeline.filter(t => t.completed).length;

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', paddingBottom: '5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--admin-text-light)',
                        cursor: 'pointer',
                        marginBottom: '1rem',
                        fontSize: '0.875rem',
                        padding: '0.5rem 0'
                    }}
                >
                    <ArrowLeft size={16} /> Back to Trips
                </button>

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
                        <Package size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--admin-primary)', fontFamily: 'monospace', margin: 0, display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                            <span>{trip.lrNumber ? `LR: ${trip.lrNumber}` : trip.orderNumber || trip.orderId || '—'}</span>
                            <span style={{ fontSize: '1rem', fontWeight: '500', opacity: 0.9 }}>{trip.orderDate || trip.date}</span>
                        </h1>
                        <div style={{ fontSize: '1.125rem', color: '#64748b', fontFamily: 'monospace', marginTop: '0.25rem' }}>
                            {trip.orderNumber || trip.orderId || '—'}
                        </div>
                        {trip.enquiryNumber && (
                            <div
                                onClick={() => navigate(`/enquiry/${trip.id}`)}
                                style={{
                                    fontSize: '0.875rem',
                                    color: '#3b82f6',
                                    marginTop: '0.5rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                <span>From Enquiry: {trip.enquiryNumber}</span>
                                <span style={{ fontSize: '0.75rem', textDecoration: 'underline' }}>View Thread</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Trip Status</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{trip.tripStatus || trip.status}</div>
                        </div>
                        <Truck size={32} style={{ opacity: 0.8 }} />
                    </div>
                </div>

                {trip.totalFreight && trip.paymentMode !== 'To Pay' && (
                    <>
                        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Freight</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                                        {trip.paymentMode === 'To Pay' ? 'TO PAY' : `₹${trip.totalFreight.toLocaleString()}`}
                                    </div>
                                </div>
                                <CreditCard size={32} style={{ opacity: 0.8 }} />
                            </div>
                        </div>

                        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Balance Due</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                                        {trip.paymentMode === 'To Pay' ? 'TO PAY' : `₹${trip.balance.toLocaleString()}`}
                                    </div>
                                </div>
                                <TrendingUp size={32} style={{ opacity: 0.8 }} />
                            </div>
                        </div>
                    </>
                )}
            </div>



            {/* Shipment Tracking (Horizontal) */}
            <div style={{ background: 'var(--admin-card-bg)', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid var(--admin-border)', marginBottom: '1.5rem', overflowX: 'auto' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={14} /> SHIPMENT TRACKING
                </h3>

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', minWidth: '600px', padding: '0 1rem' }}>
                    {/* Connecting Line - Absolute */}
                    <div style={{ position: 'absolute', top: '16px', left: '40px', right: '40px', height: '2px', background: '#e2e8f0', zIndex: 0 }}></div>

                    {/* Pickups */}
                    {trip.pickups && trip.pickups.map((p, i) => (
                        <div key={`p-${i}`} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dcfce7', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16a34a' }}></div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Pickup {i + 1}</div>
                                <div style={{ fontWeight: '600', color: 'var(--admin-primary)', fontSize: '0.875rem' }}>{p.city}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>{p.pincode}</div>
                            </div>
                        </div>
                    ))}

                    {/* In Transit Node */}
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dbeafe', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                            <Truck size={14} style={{ color: '#3b82f6' }} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase', marginBottom: '0.25rem' }}>In Transit</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>On the Way</div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--admin-text)' }}>
                                {trip.currentLocation || 'Nashik Highway'}
                            </div>
                        </div>
                    </div>

                    {/* Drops */}
                    {trip.drops && trip.drops.map((d, i) => (
                        <div key={`d-${i}`} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fee2e2', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626' }}></div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#dc2626', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Delivery {i + 1}</div>
                                <div style={{ fontWeight: '600', color: 'var(--admin-primary)', fontSize: '0.875rem' }}>{d.city}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>{d.pincode}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Driver & Vehicle */}
                {/* Driver & Vehicle */}
                {(trip.driverName || (driverPhotos && driverPhotos.length > 0)) && (
                    <div style={{ background: 'var(--admin-card-bg)', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid var(--admin-border)' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Truck size={14} /> Driver & Vehicle
                        </h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {trip.driverName && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Driver Name</div>
                                            <div style={{ fontWeight: '600', color: 'var(--admin-text)' }}>{trip.driverName}</div>
                                        </div>
                                        <a href={`tel:${trip.driverPhone}`} style={{ padding: '0.5rem', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                                            <Phone size={18} />
                                        </a>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Vehicle Number</div>
                                            <div style={{ fontWeight: '600', fontFamily: 'monospace', color: 'var(--admin-text)' }}>{trip.vehicleNo}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.1rem', fontWeight: '500' }}>{trip.requestedTrucks?.[0] || 'Standard Truck'}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Driver Phone</div>
                                            <div style={{ fontWeight: '600', color: 'var(--admin-text)' }}>{trip.driverPhone}</div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Driver Photos Section */}
                        {driverPhotos && driverPhotos.length > 0 && (
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--admin-border)' }}>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                                    Vehicle Photos ({driverPhotos.length})
                                </h4>
                                <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                    {driverPhotos.map((photo, index) => (
                                        <div
                                            key={index}
                                            onClick={() => openLightbox(driverPhotos, index)}
                                            style={{
                                                flexShrink: 0,
                                                width: '64px',
                                                height: '64px',
                                                borderRadius: '0.5rem',
                                                overflow: 'hidden',
                                                border: '1px solid var(--admin-border)',
                                                cursor: 'pointer',
                                                position: 'relative'
                                            }}
                                        >
                                            <img src={photo.url} alt={photo.type} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Shipment Photos Card (Loading/Unloading) */}
                {(loadingPhotos.length > 0 || unloadingPhotos.length > 0) && (
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '0.75rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e2e8f0',
                        padding: '1.5rem',
                    }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Package size={20} /> Shipment Photos
                        </h3>

                        {/* Loading Photos */}
                        {loadingPhotos.length > 0 && (
                            <div style={{ marginBottom: unloadingPhotos.length > 0 ? '1.5rem' : 0 }}>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                                    Loading ({loadingPhotos.length})
                                </h4>
                                <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                    {loadingPhotos.map((photo, index) => (
                                        <div
                                            key={index}
                                            onClick={() => openLightbox(loadingPhotos, index)}
                                            style={{ flexShrink: 0, width: '64px', height: '64px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--admin-border)', cursor: 'pointer' }}
                                        >
                                            <img src={photo.url} alt={photo.type} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Unloading Photos */}
                        {unloadingPhotos.length > 0 && (
                            <div>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                                    Unloading ({unloadingPhotos.length})
                                </h4>
                                <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                    {unloadingPhotos.map((photo, index) => (
                                        <div
                                            key={index}
                                            onClick={() => openLightbox(unloadingPhotos, index)}
                                            style={{ flexShrink: 0, width: '64px', height: '64px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--admin-border)', cursor: 'pointer' }}
                                        >
                                            <img src={photo.url} alt={photo.type} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}


                {/* Payment Details - Hide if To Pay */}
                {
                    trip.totalFreight && trip.paymentMode !== 'To Pay' && (
                        <div style={{ background: 'var(--admin-card-bg)', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid var(--admin-border)' }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CreditCard size={14} /> Payment Details
                            </h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-light)' }}>Payment Mode</span>
                                    <span style={{ fontWeight: '600', padding: '0.25rem 0.5rem', background: 'var(--admin-bg)', borderRadius: '0.375rem', fontSize: '0.875rem' }}>{trip.paymentMode}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-light)' }}>Total Freight</span>
                                    <span style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                                        {trip.paymentMode === 'To Pay' ? 'TO PAY' : `₹${trip.totalFreight.toLocaleString()}`}
                                    </span>
                                </div>
                                {trip.paymentMode !== 'To Pay' && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-light)' }}>Advance Paid</span>
                                        <span style={{ fontWeight: '600', color: '#16a34a', fontFamily: 'monospace' }}>₹{trip.advance.toLocaleString()}</span>
                                    </div>
                                )}
                                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--admin-bg)', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
                                    <span style={{ fontWeight: '700', color: 'var(--admin-primary)' }}>Balance Due</span>
                                    <span style={{ fontWeight: '700', fontSize: '1.125rem', color: 'var(--admin-primary)', fontFamily: 'monospace' }}>
                                        {trip.paymentMode === 'To Pay' ? 'TO PAY' : `₹${trip.balance.toLocaleString()}`}
                                    </span>
                                </div>

                                {/* Payment History */}
                                {trip.paymentHistory && trip.paymentHistory.length > 0 && (
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--admin-border)' }}>
                                        <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--admin-text-light)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Transaction History</h4>
                                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                                            {trip.paymentHistory.map((pay, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', padding: '0.5rem', background: 'var(--admin-bg)', borderRadius: '0.375rem' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: 'var(--admin-text)' }}>{pay.type}</div>
                                                        <div style={{ fontSize: '0.625rem', color: 'var(--admin-text-light)' }}>{pay.date}</div>
                                                    </div>
                                                    <div style={{ fontWeight: '700', fontFamily: 'monospace' }}>₹{parseFloat(pay.amount).toLocaleString()}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }

                {/* Consignee Details */}
                <div style={{ background: 'var(--admin-card-bg)', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid var(--admin-border)' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={14} /> Consignee Details
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Company/Receiver Name</div>
                            <div style={{ fontWeight: '600', color: 'var(--admin-text)' }}>
                                {trip.consignments?.[0]?.consignee || trip.drops?.[0]?.companyName || '—'}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Receiver Phone</div>
                            <div style={{ fontWeight: '600', color: 'var(--admin-text)' }}>
                                {trip.consignments?.[0]?.consigneePhone || trip.drops?.[0]?.phone || '—'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Material Details */}
                <div style={{ background: 'var(--admin-card-bg)', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid var(--admin-border)' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Package size={14} /> Material Details
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {trip.materials && trip.materials.map((m, i) => (
                            <div key={i} style={{ padding: '0.75rem', background: 'var(--admin-bg)', borderRadius: '0.5rem', border: '1px solid var(--admin-border)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Material</div>
                                <div style={{ fontWeight: '600', color: 'var(--admin-text)' }}>{m.type}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-light)', marginTop: '0.5rem' }}>{m.weight} • {m.quantity} Qty</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div >





            {/* Document Management */}
            < div style={{ background: 'var(--admin-card-bg)', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid var(--admin-border)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--admin-text)', marginBottom: '1.5rem' }}>
                    Document Management
                </h3>

                {/* Transport Documents */}
                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                        TRANSPORT DOCUMENTS
                    </h4>
                    {(!trip.documents || trip.documents.filter(d => (d.type === 'Lorry Receipt' || d.type === 'LR' || d.name.includes('LR') || d.type.includes('LR')) && (d.visibility !== 'admin' || trip.paymentMode !== 'To Pay')).length === 0) ? (
                        <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-light)', fontStyle: 'italic', padding: '1rem', background: 'var(--admin-bg)', borderRadius: '0.5rem' }}>
                            No LR document available.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {trip.documents.filter(d => (d.type === 'Lorry Receipt' || d.type === 'LR' || d.name.includes('LR') || d.type.includes('LR')) && (d.visibility !== 'admin' || trip.paymentMode !== 'To Pay')).map((doc, idx) => (
                                <div key={idx} style={{ padding: '1rem', border: '1px solid var(--admin-border)', borderRadius: '0.5rem', background: 'white', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: '#e0f2fe', color: '#0369a1' }}>
                                            <FileText size={20} />
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{doc.date}</span>
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: '600', fontSize: '0.875rem', color: '#0f172a', marginBottom: '0.25rem' }}>{doc.name}</h4>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{doc.type}</p>
                                    </div>
                                    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                                        <button onClick={() => window.open(doc.url, "_blank")} style={{ fontSize: '0.875rem', fontWeight: '600', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>View</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Uploaded Client Documents */}
                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                        UPLOADED DOCUMENTS
                    </h4>
                    {(!trip.documents || trip.documents.filter(d => d.uploadedBy === 'Client' || ['Payment Reference', 'E-Way Bill', 'Material Invoice', 'Material Insurance', 'Packing List', 'Delivery Challan'].includes(d.type)).length === 0) ? (
                        <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-light)', fontStyle: 'italic', padding: '1rem', background: 'var(--admin-bg)', borderRadius: '0.5rem' }}>
                            No client documents uploaded yet.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {trip.documents.filter(d => d.uploadedBy === 'Client' || ['Payment Reference', 'E-Way Bill', 'Material Invoice', 'Material Insurance', 'Packing List', 'Delivery Challan'].includes(d.type)).map((doc, idx) => (
                                <div key={idx} style={{ padding: '1rem', border: '1px solid var(--admin-border)', borderRadius: '0.5rem', background: 'white', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: '#e0f2fe', color: '#0369a1' }}>
                                            <FileText size={20} />
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{doc.date}</span>
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: '600', fontSize: '0.875rem', color: '#0f172a', marginBottom: '0.25rem' }}>{doc.name}</h4>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{doc.type}</p>
                                    </div>
                                    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                                        <button onClick={() => window.open(doc.url, "_blank")} style={{ fontSize: '0.875rem', fontWeight: '600', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>View</button>
                                        <button style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upload Options */}
                <div>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                        CLIENT DOCUMENTS OPTIONS
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {['E-Way Bill', 'Material Invoice', 'Material Insurance', 'Packing List', 'Delivery Challan', 'Payment Reference', 'Other Document'].map((type) => (
                            <button
                                key={type}
                                onClick={() => {
                                    setDocType(type);
                                    setUploadModalOpen(true);
                                }}
                                style={{
                                    padding: '0.75rem 1rem',
                                    border: '1px solid var(--admin-border)',
                                    borderRadius: '0.5rem',
                                    background: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'var(--admin-text)',
                                    marginBottom: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.borderColor = '#3b82f6';
                                    e.currentTarget.style.color = '#3b82f6';
                                    e.currentTarget.style.background = '#eff6ff';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--admin-border)';
                                    e.currentTarget.style.color = 'var(--admin-text)';
                                    e.currentTarget.style.background = 'white';
                                }}
                            >
                                <Upload size={14} /> {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div >

            {/* Upload Modal */}
            {
                uploadModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
                        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Upload Document</h3>
                                <button onClick={() => setUploadModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Document Type</label>
                                    <select
                                        value={docType}
                                        onChange={(e) => setDocType(e.target.value)}
                                        style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--admin-border)', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                                    >
                                        <option value="Payment Reference">Payment Reference (UTR)</option>
                                        <option value="Measurement Sheet">Measurement Sheet</option>
                                        <option value="Signed POD">Signed POD</option>
                                        <option value="Other Document">Other Document</option>
                                    </select>
                                </div>
                                {docType === 'Other Document' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Document Name</label>
                                        <input
                                            type="text"
                                            value={customName}
                                            onChange={(e) => setCustomName(e.target.value)}
                                            style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--admin-border)', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                                            placeholder="e.g. Weigh Slip"
                                        />
                                    </div>
                                )}
                                <div style={{ border: '2px dashed var(--admin-border)', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', background: 'var(--admin-bg)' }}>
                                    <Upload size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--admin-text-light)' }} />
                                    <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-light)', margin: 0 }}>Tap to select photo/file</p>
                                </div>
                                <button
                                    onClick={handleUploadEntry}
                                    style={{ width: '100%', padding: '0.75rem', background: 'var(--admin-primary)', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Upload
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Lightbox */}
            {
                lightboxOpen && (
                    <ImageLightbox
                        images={lightboxImages}
                        initialIndex={lightboxIndex}
                        onClose={() => setLightboxOpen(false)}
                    />
                )
            }
        </div >
    );
};

export default TripDetail;
