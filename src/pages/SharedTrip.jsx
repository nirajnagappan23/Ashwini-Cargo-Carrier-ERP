
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Phone, Truck, CreditCard, MapPin, Package, TrendingUp, Users, FileText } from 'lucide-react';
import ImageLightbox from '../components/ImageLightbox';

const SharedTrip = () => {
    const { id } = useParams();
    const { enquiries } = useApp();

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    let trip = enquiries.find(e => e.id === id);

    // Mock Backend: Read from LocalStorage if available (to sync with Admin uploads in local demo)
    try {
        const saved = localStorage.getItem(`MOCK_TRIP_${id}`);
        if (saved) {
            trip = { ...trip, ...JSON.parse(saved) };
        }
    } catch (e) { console.error("Error reading mock data", e); }

    if (!trip) return <div className="p-8 text-center" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Trip Details Not Found or Expired</div>;

    const driverPhotos = trip.driverPhotos || [];
    const loadingPhotos = trip.loadingPhotos || [];
    const unloadingPhotos = trip.unloadingPhotos || [];

    const [lightboxImages, setLightboxImages] = useState([]);

    const openLightbox = (images, index) => {
        setLightboxImages(images);
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', paddingBottom: '5rem', background: '#f8fafc', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', color: '#1e40af', borderRadius: '99px', fontSize: '0.875rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                    <Truck size={14} style={{ marginRight: '0.5rem' }} /> Shared Trip Details
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
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
                    <div style={{ textAlign: 'left' }}>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--admin-primary)', fontFamily: 'monospace', margin: 0, display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                            <span>{trip.lrNumber ? `LR: ${trip.lrNumber}` : trip.orderNumber || trip.orderId || '—'}</span>
                            <span style={{ fontSize: '1rem', fontWeight: '500', opacity: 0.9 }}>{trip.orderDate || trip.date}</span>
                        </h1>
                        <div style={{ fontSize: '1.125rem', color: '#64748b', fontFamily: 'monospace', marginTop: '0.25rem' }}>
                            {trip.orderNumber || trip.orderId || '—'}
                        </div>
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

                {trip.totalFreight && (
                    <>
                        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Freight</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                                        {trip.paymentMode === 'To Pay' ? `₹${trip.totalFreight.toLocaleString()} (TO PAY)` : `₹${trip.totalFreight.toLocaleString()}`}
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

            {/* Shipment Tracking */}
            <div style={{ background: 'var(--admin-card-bg)', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid var(--admin-border)', marginBottom: '1.5rem', overflowX: 'auto' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={14} /> SHIPMENT TRACKING
                </h3>

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', minWidth: '600px', padding: '0 1rem' }}>
                    <div style={{ position: 'absolute', top: '16px', left: '40px', right: '40px', height: '2px', background: '#e2e8f0', zIndex: 0 }}></div>

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
                {trip.driverName && (
                    <div style={{ background: 'var(--admin-card-bg)', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid var(--admin-border)' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Truck size={14} /> Driver & Vehicle
                        </h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
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
                        </div>

                        {/* Driver Photos Section */}
                        {driverPhotos.length > 0 && (
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--admin-border)' }}>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                                    Vehicle Photos
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
                    <div style={{ background: 'var(--admin-card-bg)', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid var(--admin-border)' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Package size={14} /> Shipment Photos
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

                {/* Payment Details (Always Show) */}
                {trip.totalFreight && (
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
                                    {trip.paymentMode === 'To Pay' ? `₹${trip.totalFreight.toLocaleString()}` : `₹${trip.totalFreight.toLocaleString()}`}
                                </span>
                            </div>
                            {trip.advance > 0 && (
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
                )}

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
            </div>

            {/* Document Management View Only */}
            <div style={{ background: 'var(--admin-card-bg)', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid var(--admin-border)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--admin-text)', marginBottom: '1.5rem' }}>
                    Document Management
                </h3>

                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                        TRANSPORT DOCUMENTS (Client View)
                    </h4>
                    {(!trip.documents || trip.documents.filter(d => (d.type === 'LR Safe Copy' || d.type === 'Lorry Receipt' || d.type === 'LR' || d.name.includes('LR')) && d.visibility !== 'admin' && !d.name.includes('MASTER')).length === 0) ? (
                        <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-light)', fontStyle: 'italic', padding: '1rem', background: 'var(--admin-bg)', borderRadius: '0.5rem' }}>
                            No LR document available.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {trip.documents.filter(d => (d.type === 'LR Safe Copy' || d.type === 'Lorry Receipt' || d.type === 'LR' || d.name.includes('LR')) && d.visibility !== 'admin' && !d.name.includes('MASTER')).map((doc, idx) => (
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                <p>Shared Tracking Link • Ashwini Cargo Carrier & Logistics</p>
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <ImageLightbox
                    images={lightboxImages}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </div>
    );
};

export default SharedTrip;
