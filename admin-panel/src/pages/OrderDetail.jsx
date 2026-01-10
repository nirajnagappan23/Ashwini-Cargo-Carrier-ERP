import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { ArrowLeft, Edit, Save, Upload, Phone, Truck, MapPin, FileText, Plus, Eye, Trash2, X, CheckCircle, Clock, Package, CreditCard, Camera } from 'lucide-react';
import ImageLightbox from '../components/ImageLightbox';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { orders, updateOrderDetails, updateOrderStatus, addTrackingUpdate, addDocument, deleteDocument, recordPayment, getCurrentUser } = useAdmin();
    const order = orders.find(o => o.id === id);

    const currentUser = getCurrentUser();
    const role = currentUser?.role;

    // Permissions Logic
    const isDirector = role === 'Director';
    const isManager = role === 'Manager';
    const isActiveAdmin = role === 'Master Admin' || role === 'Admin';

    // 1. Edit General Details (Driver, Vehicle, Fees) - Admins Only
    const canEditDetails = isActiveAdmin;

    // 2. Update Trip Status/Location - Admins + Managers (NOT Directors)
    const canUpdateStatus = isActiveAdmin || isManager;

    // 3. Record Payments - Admins Only
    const canRecordPayments = isActiveAdmin;

    const [isEditing, setIsEditing] = useState(false);
    const [editedOrder, setEditedOrder] = useState(order || {});
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedDocType, setSelectedDocType] = useState('');
    const [customDocName, setCustomDocName] = useState('');
    const [customLocation, setCustomLocation] = useState('');

    // Driver Photos State
    const [photoUploadModalOpen, setPhotoUploadModalOpen] = useState(false);
    const [photoType, setPhotoType] = useState('Vehicle Front');
    const [photoCategory, setPhotoCategory] = useState('driver'); // 'driver', 'loading', 'unloading'
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // --- OCR SAFE MODE ---
    const [processingLR, setProcessingLR] = useState(false);

    const handleLRScan = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setProcessingLR(true);
        try {
            // DYNAMIC IMPORT: Prevents "White Screen" crash on initial load
            const { createWorker } = await import('tesseract.js');

            const worker = await createWorker('eng');
            const ret = await worker.recognize(file);
            const text = ret.data.text;
            await worker.terminate();

            console.log("OCR Extracted:", text);

            // --- Parsing Logic (Ashwini Cargo Format) ---
            const extractValue = (regex) => {
                const match = text.match(regex);
                return match ? match[1].trim() : null;
            };

            const truckNo = extractValue(/Truck\/No\.:\s*([A-Z0-9]+)/i);
            const driverPhone = extractValue(/Mobile:\s*(\d{10})/);
            const paymentStatus = extractValue(/Payment Status:\s*(Paid|To Pay)/i);
            // Freight: Matches 'Total Freight 1,00,000' or 'Total Freight: 100000'
            const totalFreightRaw = extractValue(/Total Freight[:\s]*([\d,]+)/i);
            const totalFreight = totalFreightRaw ? parseFloat(totalFreightRaw.replace(/,/g, '')) : null;
            const consignee = extractValue(/Consignee[:\s]*(.*)/i);

            // --- Review Popup ---
            let confirmMsg = "Found Details from LR:\n";
            let foundAny = false;

            if (truckNo) { confirmMsg += `- Truck No: ${truckNo}\n`; foundAny = true; }
            if (driverPhone) { confirmMsg += `- Driver Phone: ${driverPhone}\n`; foundAny = true; }
            if (paymentStatus) { confirmMsg += `- Payment Mode: ${paymentStatus}\n`; foundAny = true; }
            if (totalFreight) { confirmMsg += `- Total Freight: ₹${totalFreight}\n`; foundAny = true; }
            if (consignee) { confirmMsg += `- Consignee: ${consignee}\n`; foundAny = true; }

            if (!foundAny) {
                alert("Could not extract clear details. Please check the image quality.");
                return;
            }

            confirmMsg += "\nUpdate Order with these details?";

            if (window.confirm(confirmMsg)) {
                const updates = {};
                if (truckNo) updates.vehicleNo = truckNo;
                if (driverPhone) updates.driverPhone = driverPhone;
                if (paymentStatus) updates.paymentMode = paymentStatus;
                if (totalFreight) {
                    updates.totalFreight = totalFreight;
                    // Auto-Calculate Balance based on Payment Status
                    if (paymentStatus === 'To Pay') updates.balance = totalFreight;
                    if (paymentStatus === 'Paid') updates.balance = 0;
                }
                // Note: Consignee extraction is tricky for addresses. 
                // We'll mapped it to 'consignments' update logic conceptually, 
                // but simpler to just log it or update description for now.
                // For this MVP, we focus on Trip/Truck details.

                updateOrderDetails(id, updates);

                // Auto-Upload as "Master LR"
                addDocument(id, {
                    name: "Master LR (Auto-Scan)",
                    type: "LR Copy",
                    uploadedBy: "Admin",
                    url: URL.createObjectURL(file)
                });

                // UI Refresh
                setEditedOrder(prev => ({ ...prev, ...updates }));
                alert("Order Updated Successfully!");
            }

        } catch (err) {
            console.error("OCR Error:", err);
            alert("Scanner failed to load. Please check your internet connection.");
        } finally {
            setProcessingLR(false);
        }
    };

    const driverPhotos = order.driverPhotos || [];
    const loadingPhotos = order.loadingPhotos || [];
    const unloadingPhotos = order.unloadingPhotos || [];

    const handleDriverPhotoUpload = () => {
        // Mock Upload Logic
        const newPhoto = {
            type: photoType,
            url: 'https://images.unsplash.com/photo-1621955964441-c173e01c135b?auto=format&fit=crop&q=80&w=600&h=600' // Mock Image
        };

        let updatedOrder = { ...order };

        if (photoCategory === 'driver') {
            updatedOrder.driverPhotos = [...(order.driverPhotos || []), newPhoto];
        } else if (photoCategory === 'loading') {
            updatedOrder.loadingPhotos = [...(order.loadingPhotos || []), newPhoto];
        } else if (photoCategory === 'unloading') {
            updatedOrder.unloadingPhotos = [...(order.unloadingPhotos || []), newPhoto];
        }

        updateOrderDetails(id, updatedOrder); // Save immediately

        // Mock Backend: Persist to LocalStorage for cross-tab/panel sync in Demo
        localStorage.setItem(`MOCK_TRIP_${id}`, JSON.stringify(updatedOrder));

        setPhotoUploadModalOpen(false);
        alert("Photo Uploaded Successfully");
    };

    const openLightbox = (images, index) => {
        setLightboxImages(images);
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    // Payment Modal State
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        type: 'Advance',
        customType: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    if (!order) {
        return <div className="admin-card">Order not found</div>;
    }

    const handleSave = () => {
        updateOrderDetails(id, editedOrder);
        setIsEditing(false);
    };

    const handleStatusChange = (newStatus) => {
        updateOrderStatus(id, newStatus);
        setEditedOrder({ ...editedOrder, tripStatus: newStatus });
    };

    const handlePaymentSubmit = () => {
        if (!paymentForm.amount) return alert("Please enter amount");

        const finalType = paymentForm.type === 'Custom' ? paymentForm.customType : paymentForm.type;
        if (!finalType) return alert("Please specify payment type");

        recordPayment(id, {
            type: finalType,
            amount: paymentForm.amount,
            date: paymentForm.date,
            notes: paymentForm.notes
        });

        setPaymentModalOpen(false);
        // Reset form
        setPaymentForm({
            type: 'Advance',
            customType: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            notes: ''
        });
        alert("Payment Recorded Successfully");
    };

    const handleActualUploadSubmit = () => {
        if (selectedDocType === 'Custom' && !customDocName.trim()) {
            alert("Please enter a name for the custom document.");
            return;
        }

        const docName = selectedDocType === 'Custom' ? customDocName : selectedDocType;

        addDocument(id, {
            name: docName,
            type: selectedDocType,
            uploadedBy: 'Admin',
            url: '#' // Mock URL
        });

        alert(`Document "${docName}" uploaded successfully!`);
        setUploadModalOpen(false);
        setCustomDocName('');
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="admin-btn admin-btn-outline"
                    style={{ marginBottom: '1rem' }}
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        {/* LR Number - Primary */}
                        {/* LR Number - Primary */}
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', fontFamily: 'monospace', color: 'var(--admin-primary)', display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                            <span>{(order.lrNumber || order.consignments?.[0]?.lrNumber) ? `LR: ${order.lrNumber || order.consignments?.[0]?.lrNumber}` : '—'}</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: '500', opacity: 0.9 }}>{order.orderDate}</span>
                        </h1>

                        {/* Order Number - Secondary */}
                        <p style={{ fontSize: '1.125rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '0.25rem' }}>
                            {order.orderNumber || order.orderId || '—'}
                        </p>

                        {/* Enquiry Number - Tertiary */}
                        {order.enquiryNumber && (
                            <p style={{ fontSize: '0.875rem', color: '#94a3b8', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
                                From {order.enquiryNumber}
                            </p>
                        )}

                        {/* Client Only */}
                        <p style={{ color: 'var(--admin-text-light)', fontSize: '0.875rem' }}>
                            {order.clientName}
                        </p>
                    </div>
                    {canEditDetails && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <label className="admin-btn admin-btn-outline" style={{ cursor: 'pointer', opacity: processingLR ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Upload size={16} />
                                {processingLR ? 'Scanning...' : 'Upload Master LR'}
                                <input type="file" hidden accept="image/*" onChange={handleLRScan} disabled={processingLR} />
                            </label>
                            <button
                                className="admin-btn admin-btn-primary"
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            >
                                {isEditing ? <><Save size={16} /> Save Changes</> : <><Edit size={16} /> Edit Order</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Status Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Trip Status</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{order.tripStatus || order.status}</div>
                            </div>
                            <Truck size={32} style={{ opacity: 0.8 }} />
                        </div>
                    </div>

                    {order.totalFreight && (
                        <>
                            <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Freight</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>₹{order.totalFreight.toLocaleString()}</div>
                                    </div>
                                    <CreditCard size={32} style={{ opacity: 0.8 }} />
                                </div>
                            </div>

                            <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Balance Due</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>₹{order.balance?.toLocaleString()}</div>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', opacity: 0.9, alignSelf: 'center' }}>Due</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Shipment Tracking (Horizontal) - Refactored for Proper State */}
                {(() => {
                    // Logic to determine active stage index
                    // Stages: 0-(N-1) Pickups, N Transit, (N+1)-(N+M) Drops
                    const pickups = order.pickups || [];
                    const drops = order.drops || [];
                    const totalStages = pickups.length + 1 + drops.length;

                    let activeIndex = 0; // Default ot first pickup
                    let isTransit = false;
                    let isCompleted = false;

                    const status = order.tripStatus || '';

                    // 1. Check Pickups
                    // If status is "Loading (City)" or "Despatched (City)"
                    let foundInPickups = false;
                    pickups.forEach((p, i) => {
                        if (status.includes(p.city)) {
                            activeIndex = i;
                            foundInPickups = true;
                        }
                    });

                    // 2. Check Transit
                    if (!foundInPickups) {
                        if (status === 'In Transit') {
                            activeIndex = pickups.length;
                            isTransit = true;
                        } else if (status.includes('Unloading') || status.includes('Delivered')) {
                            // Check Drops
                            drops.forEach((d, i) => {
                                if (status.includes(d.city)) {
                                    activeIndex = pickups.length + 1 + i;
                                }
                            });
                        } else if (status === 'Closed' || status === 'Pod Received') {
                            activeIndex = totalStages; // All done
                            isCompleted = true;
                        }
                    }

                    // Deriving Real Location from History
                    const lastHistory = order.trackingHistory && order.trackingHistory.length > 0
                        ? order.trackingHistory[order.trackingHistory.length - 1]
                        : null;
                    const activeLocation = lastHistory ? lastHistory.location : '-';

                    // Helper for styles
                    const getNodeStyle = (index) => {
                        if (index < activeIndex || isCompleted) return { bg: '#dcfce7', border: '#16a34a', dot: '#16a34a', text: '#16a34a', label: 'Completed' };
                        if (index === activeIndex) return { bg: '#dbeafe', border: '#3b82f6', dot: '#3b82f6', text: '#3b82f6', label: 'Active' }; // Blue (Active)
                        return { bg: '#f1f5f9', border: '#cbd5e1', dot: '#cbd5e1', text: '#94a3b8', label: 'Pending' }; // Gray (Pending)
                    };

                    return (
                        <div className="admin-card" style={{ overflowX: 'auto' }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={14} /> SHIPMENT TRACKING
                            </h3>

                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', minWidth: '600px', padding: '0 1rem' }}>
                                {/* Connecting Line */}
                                <div style={{ position: 'absolute', top: '16px', left: '40px', right: '40px', height: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
                                {/* Fill Line based on progress? Hard to do perfectly with flex, assume simple gray line behind is enough, or we can use gradient if needed. Gray is fine for MVP. */}

                                {/* Pickups */}
                                {pickups.map((p, i) => {
                                    const style = getNodeStyle(i);
                                    return (
                                        <div key={`p-${i}`} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: style.bg, border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', outline: `2px solid ${style.border}` }}>
                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: style.dot }}></div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: style.text, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Pickup {i + 1}</div>
                                                <div style={{ fontWeight: '600', color: 'var(--admin-primary)', fontSize: '0.875rem' }}>{p.city}</div>
                                                {i === activeIndex && <div style={{ fontSize: '0.7rem', color: style.text }}>(Current)</div>}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* In Transit Node */}
                                {(() => {
                                    const transitIndex = pickups.length;
                                    const style = getNodeStyle(transitIndex);

                                    // Logic: IF this node is Active (Transit), show the Real Location (e.g. 'Nashik Highway'). 
                                    // IF it is Passed, show 'Crossed'. IF Pending, show 'Waiting'.
                                    let displayLoc = 'Waiting';
                                    if (activeIndex > transitIndex || isCompleted) displayLoc = 'Crossed';
                                    else if (activeIndex === transitIndex) displayLoc = activeLocation; // The Dynamic Location

                                    return (
                                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: style.bg, border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', outline: `2px solid ${style.border}` }}>
                                                <Truck size={14} style={{ color: style.text }} />
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: style.text, textTransform: 'uppercase', marginBottom: '0.25rem' }}>In Transit</div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--admin-text)' }}>
                                                    {displayLoc}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Drops */}
                                {drops.map((d, i) => {
                                    const dropIndex = pickups.length + 1 + i;
                                    const style = getNodeStyle(dropIndex);
                                    return (
                                        <div key={`d-${i}`} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: style.bg, border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', outline: `2px solid ${style.border}` }}>
                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: style.dot }}></div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: style.text, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Delivery {i + 1}</div>
                                                <div style={{ fontWeight: '600', color: 'var(--admin-primary)', fontSize: '0.875rem' }}>{d.city}</div>
                                                {dropIndex === activeIndex && <div style={{ fontSize: '0.7rem', color: style.text }}>(Current)</div>}
                                            </div>
                                        </div>
                                    );
                                })}

                            </div>
                        </div>
                    );
                })()}
                {/* Status Update */}
                {canUpdateStatus && (
                    <div className="admin-card">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Update Trip Status & Location</h3>

                        {/* Manual Location Input */}
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#475569' }}>
                                Current Location / Tracking Update
                            </label>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <input
                                    type="text"
                                    placeholder="e.g. Crossed Toll Plaza, Near Bangalore..."
                                    value={customLocation}
                                    onChange={(e) => setCustomLocation(e.target.value)}
                                    style={{ flex: 1, padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                                />
                                <button
                                    onClick={() => {
                                        if (!customLocation.trim()) return alert("Please enter a location/update first.");

                                        const historyEntry = {
                                            status: order.tripStatus, // Keep current status
                                            location: customLocation,
                                            date: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }),
                                            completed: true
                                        };
                                        addTrackingUpdate(id, historyEntry);
                                        setCustomLocation(''); // Clear
                                        alert("Location updated successfully!");
                                    }}
                                    className="admin-btn admin-btn-outline"
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    <MapPin size={16} /> Update Location Only
                                </button>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                                * Typing a location above will also override the default location when you click a Status button below.
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                            {/* Dynamic Status Options */}
                            {(() => {
                                const statusOptions = [];

                                // 1. Pickups
                                if (order.pickups) {
                                    order.pickups.forEach((p, i) => {
                                        statusOptions.push({ label: `Loading (${p.city})`, value: `Loading (${p.city})`, location: `${p.city} - ${p.address || ''}` });
                                        statusOptions.push({ label: `Despatched (${p.city})`, value: `Despatched (${p.city})`, location: p.city });
                                    });
                                }

                                // 2. Transit
                                statusOptions.push({ label: 'In Transit', value: 'In Transit', location: 'On Route' });

                                // 3. Drops
                                if (order.drops) {
                                    order.drops.forEach((d, i) => {
                                        statusOptions.push({ label: `Unloading (${d.city})`, value: `Unloading (${d.city})`, location: `${d.city} - ${d.companyName || ''}` });
                                        statusOptions.push({ label: `Delivered (${d.city})`, value: `Delivered (${d.city})`, location: d.city });
                                    });
                                }

                                // 4. Final
                                statusOptions.push({ label: 'Pod Received', value: 'Pod Received', location: '-' });
                                statusOptions.push({ label: 'Trip Closed', value: 'Closed', location: '-' });

                                // Calculate current progress index for visual indication
                                const currentStatusIndex = statusOptions.findIndex(s => s.value === order.tripStatus);

                                return statusOptions.map((option, idx) => {
                                    const isCompleted = idx <= currentStatusIndex;
                                    const isCurrent = option.value === order.tripStatus;

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                handleStatusChange(option.value);
                                                // Also add to tracking history
                                                const historyEntry = {
                                                    status: option.value,
                                                    // Priority: Custom Input > Option Default
                                                    location: customLocation.trim() ? customLocation : option.location,
                                                    date: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }),
                                                    completed: true
                                                };
                                                // Assume addTrackingUpdate is available from context
                                                if (addTrackingUpdate) {
                                                    addTrackingUpdate(id, historyEntry);
                                                }
                                                if (customLocation.trim()) setCustomLocation(''); // Clear after use
                                            }}
                                            className="admin-btn"
                                            style={{
                                                background: isCurrent ? 'var(--admin-primary)' : (isCompleted ? '#dcfce7' : 'transparent'),
                                                color: isCurrent ? 'white' : (isCompleted ? '#166534' : 'var(--admin-text)'),
                                                border: isCurrent ? 'none' : (isCompleted ? '1px solid #86efac' : '1px solid var(--admin-border)'),
                                                padding: '0.75rem',
                                                fontSize: '0.8rem',
                                                textAlign: 'left',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'start',
                                                gap: '0.25rem'
                                            }}
                                        >
                                            <div style={{ fontWeight: '600' }}>{option.label}</div>
                                            {isCompleted && idx < currentStatusIndex && <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>✓ Completed</div>}
                                        </button>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Driver & Vehicle */}
                        <div className="admin-card">
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Truck size={20} /> Driver & Vehicle Assignment
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', display: 'block', marginBottom: '0.5rem' }}>
                                        Driver Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedOrder.driverName || ''}
                                            onChange={(e) => setEditedOrder({ ...editedOrder, driverName: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--admin-border)', borderRadius: '0.375rem' }}
                                        />
                                    ) : (
                                        <div style={{ fontWeight: '500' }}>{order.driverName || 'Not Assigned'}</div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', display: 'block', marginBottom: '0.5rem' }}>
                                        Driver Phone
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedOrder.driverPhone || ''}
                                            onChange={(e) => setEditedOrder({ ...editedOrder, driverPhone: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--admin-border)', borderRadius: '0.375rem' }}
                                        />
                                    ) : (
                                        <div style={{ fontWeight: '500' }}>{order.driverPhone || 'Not Assigned'}</div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', display: 'block', marginBottom: '0.5rem' }}>
                                        Vehicle Number
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedOrder.vehicleNo || ''}
                                            onChange={(e) => setEditedOrder({ ...editedOrder, vehicleNo: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--admin-border)', borderRadius: '0.375rem' }}
                                        />
                                    ) : (
                                        <div>
                                            <div style={{ fontWeight: '500' }}>{order.vehicleNo || 'Not Assigned'}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.1rem', fontWeight: '500' }}>{order.requestedTrucks?.[0] || 'Standard Truck'}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Driver Photos Section */}
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--admin-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Vehicle & Driver Docs
                                </h4>
                                <button
                                    onClick={() => {
                                        setPhotoCategory('driver');
                                        setPhotoType('Vehicle Front');
                                        setPhotoUploadModalOpen(true);
                                    }}
                                    className="admin-btn admin-btn-outline"
                                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                >
                                    <Camera size={14} /> Upload Photos
                                </button>
                            </div>

                            {driverPhotos.length > 0 ? (
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
                            ) : (
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', fontStyle: 'italic' }}>
                                    No photos uploaded (RC, DL, Plate, etc.)
                                </div>
                            )}
                        </div>

                        {/* Loading Photos Section */}
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--admin-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Loading Photos
                                </h4>
                                <button
                                    onClick={() => {
                                        setPhotoCategory('loading');
                                        setPhotoType('Loading Site');
                                        setPhotoUploadModalOpen(true);
                                    }}
                                    className="admin-btn admin-btn-outline"
                                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                >
                                    <Camera size={14} /> Add Loading Photo
                                </button>
                            </div>
                            {loadingPhotos.length > 0 ? (
                                <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                    {loadingPhotos.map((photo, index) => (
                                        <div
                                            key={index}
                                            onClick={() => openLightbox(loadingPhotos, index)}
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
                            ) : (
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', fontStyle: 'italic', paddingBottom: '0.5rem' }}>No loading photos uploaded.</div>
                            )}
                        </div>

                        {/* Unloading Photos Section */}
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--admin-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--admin-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Unloading Photos
                                </h4>
                                <button
                                    onClick={() => {
                                        setPhotoCategory('unloading');
                                        setPhotoType('Unloading Site');
                                        setPhotoUploadModalOpen(true);
                                    }}
                                    className="admin-btn admin-btn-outline"
                                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                >
                                    <Camera size={14} /> Add Unloading Photo
                                </button>
                            </div>
                            {unloadingPhotos.length > 0 ? (
                                <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                    {unloadingPhotos.map((photo, index) => (
                                        <div
                                            key={index}
                                            onClick={() => openLightbox(unloadingPhotos, index)}
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
                            ) : (
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', fontStyle: 'italic', paddingBottom: '0.5rem' }}>No unloading photos uploaded.</div>
                            )}
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="admin-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Payment Details</h3>
                            {canRecordPayments && (
                                <button
                                    onClick={() => setPaymentModalOpen(true)}
                                    className="admin-btn admin-btn-primary"
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    <Plus size={16} /> Record Payment
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>Payment Mode</div>
                                {isEditing ? (
                                    <select
                                        value={editedOrder.paymentMode || ''}
                                        onChange={(e) => setEditedOrder({ ...editedOrder, paymentMode: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--admin-border)', borderRadius: '0.375rem', marginTop: '0.5rem' }}
                                    >
                                        <option value="Paid">Paid</option>
                                        <option value="To Pay">To Pay</option>
                                    </select>
                                ) : (
                                    <div style={{ fontWeight: '600', marginTop: '0.5rem' }}>{order.paymentMode}</div>
                                )}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>Total Freight</div>
                                <div style={{ fontWeight: '600', fontSize: '1.125rem', marginTop: '0.5rem' }}>₹{order.totalFreight?.toLocaleString()}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>Advance Paid</div>
                                <div style={{ fontWeight: '600', fontSize: '1.125rem', color: 'var(--admin-success)', marginTop: '0.5rem' }}>₹{order.advance?.toLocaleString()}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>Balance Due</div>
                                <div style={{ fontWeight: '600', fontSize: '1.125rem', color: 'var(--admin-danger)', marginTop: '0.5rem' }}>₹{order.balance?.toLocaleString()}</div>
                            </div>
                        </div>

                        {/* Payment History Table */}
                        <div>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--admin-text-light)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Payment History
                            </h4>
                            {!order.paymentHistory || order.paymentHistory.length === 0 ? (
                                <div className="text-sm text-slate-400 italic">No payments recorded yet.</div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--admin-border)', textAlign: 'left', color: 'var(--admin-text-light)' }}>
                                                <th style={{ padding: '0.5rem' }}>Date</th>
                                                <th style={{ padding: '0.5rem' }}>Type</th>
                                                <th style={{ padding: '0.5rem' }}>Amount</th>
                                                <th style={{ padding: '0.5rem' }}>Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.paymentHistory.map((pay, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '0.5rem' }}>{pay.date}</td>
                                                    <td style={{ padding: '0.5rem' }}>{pay.type}</td>
                                                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>₹{parseFloat(pay.amount).toLocaleString()}</td>
                                                    <td style={{ padding: '0.5rem', color: 'var(--admin-text-light)' }}>{pay.notes || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Client & Consignor Info */}
                    <div className="admin-card">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Client Information</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>Client Name</div>
                                <div style={{ fontWeight: '500' }}>{order.clientName}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>Phone</div>
                                <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Phone size={14} /> {order.clientPhone}
                                </div>
                            </div>
                        </div>

                        {/* Consignee Details */}
                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--admin-border)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Consignee Details</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>Name</div>
                                    <div style={{ fontWeight: '500' }}>
                                        {order.consignments?.[0]?.consignee || order.drops?.[0]?.companyName || '—'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>Phone</div>
                                    <div style={{ fontWeight: '500' }}>
                                        {order.consignments?.[0]?.consigneePhone || order.drops?.[0]?.phone || '—'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>Destination</div>
                                    <div style={{ fontSize: '0.875rem' }}>
                                        {order.consignments?.[0]?.destination || order.drops?.[0]?.city || '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Material Details */}
                    <div className="admin-card">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Package size={20} /> Material Details
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            {order.materials && order.materials.length > 0 ? (
                                order.materials.map((m, i) => (
                                    <div key={i} style={{ padding: '1rem', background: 'var(--admin-bg)', borderRadius: '0.5rem', border: '1px solid var(--admin-border)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Material Type</div>
                                        <div style={{ fontWeight: '600', color: 'var(--admin-text)', marginBottom: '0.5rem' }}>{m.type}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-light)' }}>
                                            <span style={{ fontWeight: '600', color: 'var(--admin-primary)' }}>{m.weight}</span> • {m.quantity} Qty
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '1rem', background: 'var(--admin-bg)', borderRadius: '0.5rem', border: '1px solid var(--admin-border)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Material Info</div>
                                    <div style={{ fontWeight: '600', color: 'var(--admin-text)' }}>{order.consignments?.[0]?.material || 'No material details available'}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>


            {/* Document Upload Section */}
            <div className="admin-card">
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>Document Management</h3>

                {/* Uploded Client Documents List */}
                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--admin-text-light)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Uploaded Client Documents
                    </h4>
                    {!order.documents || order.documents.filter(d => ['Payment Reference', 'E-Way Bill', 'Material Invoice', 'Material Insurance', 'Packing List', 'Delivery Challan'].includes(d.type)).length === 0 ? (
                        <div className="text-sm text-slate-400 italic mb-4">No client documents uploaded yet.</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {order.documents.filter(d => ['Payment Reference', 'E-Way Bill', 'Material Invoice', 'Material Insurance', 'Packing List', 'Delivery Challan'].includes(d.type)).map((doc, idx) => (
                                <div key={idx} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                                        <FileText size={20} color={'#3b82f6'} />
                                        <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">{doc.date}</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>{doc.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{doc.type}</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #cbd5e1' }}>
                                        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium" onClick={() => window.open(doc.url, "_blank")}>View</button>
                                        <button className="text-red-400 hover:text-red-600" onClick={() => { if (window.confirm('Delete document?')) deleteDocument(order.id, idx); }}><Trash2 size={12} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Uploded Transport Documents List */}
                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--admin-text-light)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Uploaded Transport Documents
                    </h4>
                    {!order.documents || order.documents.filter(d => !['Payment Reference', 'E-Way Bill', 'Material Invoice', 'Material Insurance', 'Packing List', 'Delivery Challan'].includes(d.type)).length === 0 ? (
                        <div className="text-sm text-slate-400 italic mb-4">No transport documents uploaded yet.</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {order.documents.filter(d => !['Payment Reference', 'E-Way Bill', 'Material Invoice', 'Material Insurance', 'Packing List', 'Delivery Challan'].includes(d.type)).map((doc, idx) => (
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
                                        <button className="text-red-400 hover:text-red-600" onClick={() => { if (window.confirm('Delete document?')) deleteDocument(order.id, idx); }}><Trash2 size={12} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Client Documents */}
                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--admin-text-light)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Client Documents
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                        {['E-Way Bill', 'Material Invoice', 'Material Insurance', 'Packing List', 'Delivery Challan', 'Payment Reference'].map(docType => (
                            <button
                                key={docType}
                                className="admin-btn admin-btn-outline"
                                style={{ justifyContent: 'center', fontSize: '0.75rem', padding: '0.5rem' }}
                                onClick={() => {
                                    setSelectedDocType(docType);
                                    setUploadModalOpen(true);
                                }}
                            >
                                <Upload size={14} /> {docType}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Transport Documents */}
                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--admin-text-light)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Transport Documents
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                        {['LR Copy', 'Freight Bill', 'POD', 'Payment Receipt'].map(docType => (
                            <button
                                key={docType}
                                className="admin-btn admin-btn-outline"
                                style={{ justifyContent: 'center', fontSize: '0.75rem', padding: '0.5rem' }}
                                onClick={() => {
                                    setSelectedDocType(docType);
                                    setUploadModalOpen(true);
                                }}
                            >
                                <Upload size={14} /> {docType}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Document */}
                <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--admin-text-light)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Other Documents
                    </h4>
                    <button
                        className="admin-btn admin-btn-primary"
                        style={{ fontSize: '0.875rem' }}
                        onClick={() => {
                            setSelectedDocType('Custom');
                            setUploadModalOpen(true);
                        }}
                    >
                        <Upload size={16} /> Upload Custom Document
                    </button>
                </div>
            </div>

            {/* Upload Modal */}
            {uploadModalOpen && (
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
                    zIndex: 1000
                }}>
                    <div className="admin-card" style={{ maxWidth: '500px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Upload {selectedDocType}</h3>
                            <button
                                onClick={() => setUploadModalOpen(false)}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--admin-text-light)' }}
                            >
                                ×
                            </button>
                        </div>
                        {selectedDocType === 'Custom' && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                    Document Name *
                                </label>
                                <input
                                    type="text"
                                    value={customDocName}
                                    onChange={(e) => setCustomDocName(e.target.value)}
                                    placeholder="e.g., Special Permit, Insurance Certificate"
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem',
                                        border: '1px solid var(--admin-border)',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>
                        )}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                padding: '2rem',
                                border: '2px dashed var(--admin-border)',
                                borderRadius: '0.5rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: 'var(--admin-bg)'
                            }}>
                                <Upload size={32} style={{ margin: '0 auto 1rem', color: 'var(--admin-text-light)' }} />
                                <div style={{ color: 'var(--admin-text-light)', fontSize: '0.875rem' }}>
                                    Click to browse or drag and drop
                                </div>
                                <div style={{ color: 'var(--admin-text-light)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                                    PDF, JPG, PNG (Max 10MB)
                                </div>
                                <input type="file" style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png" />
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                className="admin-btn admin-btn-outline"
                                onClick={() => setUploadModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="admin-btn admin-btn-primary"
                                onClick={handleActualUploadSubmit}
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Recording Modal */}
            {paymentModalOpen && (
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
                    zIndex: 1000
                }}>
                    <div className="admin-card" style={{ maxWidth: '400px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>Record Payment</h3>
                            <button onClick={() => setPaymentModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Payment Type</label>
                                <select
                                    className="admin-input"
                                    style={{ width: '100%', padding: '0.5rem' }}
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
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Specify Type</label>
                                    <input
                                        className="admin-input"
                                        style={{ width: '100%', padding: '0.5rem' }}
                                        placeholder="e.g. Detention Charges"
                                        value={paymentForm.customType}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, customType: e.target.value })}
                                    />
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Amount (₹)</label>
                                <input
                                    type="number"
                                    className="admin-input"
                                    style={{ width: '100%', padding: '0.5rem' }}
                                    placeholder="0.00"
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Date</label>
                                <input
                                    type="date"
                                    className="admin-input"
                                    style={{ width: '100%', padding: '0.5rem' }}
                                    value={paymentForm.date}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Notes</label>
                                <textarea
                                    className="admin-input"
                                    style={{ width: '100%', padding: '0.5rem' }}
                                    placeholder="Optional notes..."
                                    rows="2"
                                    value={paymentForm.notes}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button
                                className="admin-btn admin-btn-outline"
                                onClick={() => setPaymentModalOpen(false)}
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

            {/* Driver Photo Upload Modal */}
            {photoUploadModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
                    <div className="admin-card" style={{ maxWidth: '350px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Upload Vehicle Photo</h3>
                            <button onClick={() => setPhotoUploadModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem' }}>Photo Type</label>
                            <select
                                value={photoType}
                                onChange={(e) => setPhotoType(e.target.value)}
                                className="admin-input"
                                style={{ width: '100%', padding: '0.5rem' }}
                            >
                                <option value="Vehicle Front">Vehicle Front</option>
                                <option value="Number Plate">Number Plate</option>
                                <option value="DL Front">Driving License (Front)</option>
                                <option value="DL Back">Driving License (Back)</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '1rem', border: '2px dashed #cbd5e1', borderRadius: '0.5rem', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: '#f8fafc' }}>
                            <Camera size={24} style={{ color: '#94a3b8', marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Select Image</div>
                        </div>
                        <button
                            onClick={handleDriverPhotoUpload}
                            className="admin-btn admin-btn-primary"
                            style={{ width: '100%' }}
                        >
                            Upload Photo
                        </button>
                    </div>
                </div>
            )}

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

export default OrderDetail;
