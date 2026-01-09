import React, { useState } from 'react';
import { Plus, Trash2, Truck, MapPin, Package, Edit2, Check, ChevronDown, ChevronUp, IndianRupee, Calendar, Clock, Phone } from 'lucide-react';
import './BookTruck.css';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { generateEnquiryNumber, formatDate, getEnquiryExpiry, getExpiryCountdown, isEnquiryExpired } from '../utils/numberingSystem';


const BookTruck = () => {
    const navigate = useNavigate();
    const { enquiries, addEnquiry, updateEnquiryStatus } = useApp();
    const [showForm, setShowForm] = useState(false);
    const [expandedQuote, setExpandedQuote] = useState(null);

    // Filter out confirmed trips that are already in the "Trips" section if needed, 
    // but the user asked for enquiry cards here.
    // Filter out confirmed trips
    // Filter out confirmed and cancelled trips
    const activeEnquiries = enquiries.filter(enq => enq.status !== 'Confirmed' && enq.status !== 'Cancelled');

    const [pickupDate, setPickupDate] = useState('');
    const [editingEnquiryId, setEditingEnquiryId] = useState(null);

    // Saved Locations State
    const [savedLocations, setSavedLocations] = useState(() => {
        const saved = localStorage.getItem('savedPickupLocations');
        return saved ? JSON.parse(saved) : [];
    });
    const [savedDropLocations, setSavedDropLocations] = useState(() => {
        const saved = localStorage.getItem('savedDropLocations');
        return saved ? JSON.parse(saved) : [];
    });

    // Pickups State
    const [pickups, setPickups] = useState([
        { id: 1, city: '', pincode: '', isEditing: true, saveToFavorites: false, nickname: '' }
    ]);

    // Drops State (with Consignee details per drop)
    const [drops, setDrops] = useState([
        {
            id: 1,
            city: '',
            pincode: '',
            consigneeCompany: '',
            consigneePhone: '',
            isEditing: true,
            saveToFavorites: false,
            nickname: ''
        }
    ]);

    // Saved Materials State
    const [savedMaterials, setSavedMaterials] = useState(() => {
        const saved = localStorage.getItem('savedMaterials');
        // Pre-populate with some mock data if empty for demo
        return saved ? JSON.parse(saved) : [
            { nickname: 'Std Steel Plates', type: 'Steel Plates', weight: '10', weightUnit: 'MT', packingType: 'Loose', length: '10', width: '4', height: '0.1', dimUnit: 'ft' },
            { nickname: 'Cement Bags', type: 'Cement', weight: '15', weightUnit: 'MT', packingType: 'Bag', quantity: '300', length: '0', width: '0', height: '0', dimUnit: 'ft' },
            { nickname: 'Machinery Parts', type: 'Industrial Machinery', weight: '5', weightUnit: 'MT', packingType: 'Box', length: '8', width: '6', height: '6', dimUnit: 'ft' },
        ];
    });

    // Materials State
    const [materials, setMaterials] = useState([{
        id: 1,
        nickname: '',
        type: '',
        weight: '',
        weightUnit: 'MT',
        packingType: '',
        length: '',
        width: '',
        height: '',
        dimUnit: 'ft',
        quantity: '',
        isEditing: true,
        saveToFavorites: false
    }]);

    const [loadType, setLoadType] = useState('FTL');
    const [truckTypes, setTruckTypes] = useState([]);

    // Payment Responsibility State
    const [paymentBy, setPaymentBy] = useState('Consignor');

    const handleTruckTypeChange = (type) => {
        if (truckTypes.includes(type)) setTruckTypes(truckTypes.filter(t => t !== type));
        else setTruckTypes([...truckTypes, type]);
    };

    // --- Helpers ---
    const toggleEdit = (list, setList, id, isEditing) => {
        setList(list.map(item => item.id === id ? { ...item, isEditing } : item));
    };

    const updateItem = (list, setList, id, field, value) => {
        setList(list.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    // --- Pickup Handlers ---
    const addPickup = () => {
        const newId = pickups.length + 1;
        // Collapse all others
        const collapsed = pickups.map(p => ({ ...p, isEditing: false }));
        setPickups([...collapsed, { id: newId, city: '', pincode: '', isEditing: true, saveToFavorites: false, nickname: '' }]);
    };

    const removePickup = (id) => {
        if (pickups.length > 1) setPickups(pickups.filter(p => p.id !== id));
    };

    // --- Drop Handlers ---
    const addDrop = () => {
        const newId = drops.length + 1;
        const collapsed = drops.map(d => ({ ...d, isEditing: false }));
        setDrops([...collapsed, {
            id: newId,
            city: '',
            pincode: '',
            consigneeCompany: '',
            consigneePhone: '',
            isEditing: true,
            saveToFavorites: false,
            nickname: ''
        }]);
    };

    const removeDrop = (id) => {
        if (drops.length > 1) setDrops(drops.filter(d => d.id !== id));
    };

    // --- Material Handlers ---
    const addMaterial = () => {
        const collapsed = materials.map(m => ({ ...m, isEditing: false }));
        setMaterials([...collapsed, {
            id: materials.length + 1,
            nickname: '',
            type: '',
            weight: '',
            weightUnit: 'MT',
            packingType: '',
            length: '',
            width: '',
            height: '',
            dimUnit: 'ft',
            quantity: '',
            isEditing: true,
            saveToFavorites: false
        }]);
    };

    const convertToFeet = (val, unit) => {
        const num = parseFloat(val) || 0;
        if (unit === 'ft') return num.toFixed(2);
        if (unit === 'in') return (num / 12).toFixed(2);
        if (unit === 'cm') return (num / 30.48).toFixed(2);
        if (unit === 'mm') return (num / 304.8).toFixed(2);
        return 0;
    };

    const handleEdit = (enquiry) => {
        setEditingEnquiryId(enquiry.id);
        setPickupDate(enquiry.pickupDate || '');
        setPaymentBy(enquiry.paymentBy || 'Consignor');
        setLoadType(enquiry.loadType || 'FTL');
        setTruckTypes(enquiry.requestedTrucks || []);

        if (enquiry.pickups && enquiry.pickups.length > 0) {
            setPickups(enquiry.pickups.map(p => ({ ...p, isEditing: false })));
        }
        if (enquiry.drops && enquiry.drops.length > 0) {
            setDrops(enquiry.drops.map(d => ({ ...d, isEditing: false })));
        }
        if (enquiry.materials && enquiry.materials.length > 0) {
            setMaterials(enquiry.materials.map(m => ({ ...m, isEditing: false })));
        }

        setShowForm(true);
    };

    const handleCancel = (id) => {
        if (window.confirm("Are you sure you want to cancel this enquiry?")) {
            updateEnquiryStatus(id, 'Cancelled');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic Route Construct
        const fromCity = pickups[0]?.city || 'Unknown';
        const toCity = drops[0]?.city || 'Unknown';

        // Save new Pickup locations
        pickups.forEach(p => {
            if (p.saveToFavorites && p.nickname && p.city) {
                const newLocation = { nickname: p.nickname, city: p.city, pincode: p.pincode };
                const exists = savedLocations.find(l => l.nickname === p.nickname);
                if (!exists) {
                    const newSaved = [...savedLocations, newLocation];
                    setSavedLocations(newSaved);
                    localStorage.setItem('savedPickupLocations', JSON.stringify(newSaved));
                }
            }
        });

        // Save new Drop locations
        drops.forEach(d => {
            if (d.saveToFavorites && d.nickname && d.city) {
                const newLocation = { nickname: d.nickname, city: d.city, pincode: d.pincode };
                const exists = savedDropLocations.find(l => l.nickname === d.nickname);
                if (!exists) {
                    const newSaved = [...savedDropLocations, newLocation];
                    setSavedDropLocations(newSaved);
                    localStorage.setItem('savedDropLocations', JSON.stringify(newSaved));
                }
            }
        });

        // Save new Materials
        materials.forEach(m => {
            if (m.saveToFavorites && m.nickname && m.type) {
                const newMaterial = {
                    nickname: m.nickname,
                    type: m.type,
                    weight: m.weight,
                    weightUnit: m.weightUnit,
                    packingType: m.packingType,
                    length: m.length,
                    width: m.width,
                    height: m.height,
                    dimUnit: m.dimUnit
                };
                const exists = savedMaterials.find(sm => sm.nickname === m.nickname);
                if (!exists) {
                    const newSaved = [...savedMaterials, newMaterial];
                    setSavedMaterials(newSaved);
                    localStorage.setItem('savedMaterials', JSON.stringify(newSaved));
                }
            }
        });

        // Auto-generate enquiry number and dates
        const enquiryNumber = generateEnquiryNumber();
        const currentDate = formatDate();
        const expiryDate = getEnquiryExpiry(new Date());

        // Add to Context
        const enquiryData = {
            enquiryNumber: enquiryNumber,        // Auto-generated: ENQ-XXX/DD-MMM-YY
            createdAt: new Date().toISOString(),
            expiresAt: expiryDate.toISOString(),
            route: `${fromCity} -> ${toCity}`,
            pickupDate,
            pickups,
            drops,
            materials,
            loadType,
            requestedTrucks: loadType === 'FTL' ? truckTypes : [],
            paymentBy,
        };

        if (editingEnquiryId) {
            // Update Existing
            const currentEnquiry = enquiries.find(e => e.id === editingEnquiryId);
            updateEnquiryStatus(editingEnquiryId, currentEnquiry.status, enquiryData);
            alert("Enquiry Updated Successfully!");
            setEditingEnquiryId(null);
        } else {
            // Add New
            addEnquiry(enquiryData);
            alert(`Enquiry ${enquiryNumber} Submitted Successfully!`);
        }

        // Duplicate alert removed
        navigate('/');
    };


    const handleLoadSavedLocation = (id, locationNickname) => {
        const loc = savedLocations.find(l => l.nickname === locationNickname);
        if (loc) {
            setPickups(pickups.map(p => p.id === id ? { ...p, city: loc.city, pincode: loc.pincode, nickname: loc.nickname } : p));
        }
    };

    const handleLoadSavedDropLocation = (id, locationNickname) => {
        const loc = savedDropLocations.find(l => l.nickname === locationNickname);
        if (loc) {
            setDrops(drops.map(d => d.id === id ? { ...d, city: loc.city, pincode: loc.pincode, nickname: loc.nickname } : d));
        }
    };

    const handleLoadSavedMaterial = (id, materialNickname) => {
        const mat = savedMaterials.find(m => m.nickname === materialNickname);
        if (mat) {
            setMaterials(materials.map(m => m.id === id ? {
                ...m,
                nickname: mat.nickname,
                type: mat.type,
                weight: mat.weight,
                weightUnit: mat.weightUnit,
                packingType: mat.packingType,
                length: mat.length,
                width: mat.width,
                height: mat.height,
                dimUnit: mat.dimUnit
            } : m));
        } else {
            // If typing a nickname that doesn't exist, just update the nickname field
            updateItem(materials, setMaterials, id, 'nickname', materialNickname);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', paddingBottom: '5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                            <Truck size={24} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--admin-primary)', margin: 0 }}>
                                Transport Enquiries
                            </h1>
                            <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-light)', margin: '0.25rem 0 0 0' }}>
                                Manage your existing enquiries or book a new truck
                            </p>
                        </div>
                    </div>
                    {!showForm && (
                        <button
                            onClick={() => {
                                setEditingEnquiryId(null);
                                setPickups([{ id: 1, city: '', pincode: '', isEditing: true, saveToFavorites: false, nickname: '' }]);
                                setDrops([{ id: 1, city: '', pincode: '', isEditing: true, saveToFavorites: false, nickname: '' }]);
                                setMaterials([{ id: 1, nickname: '', type: '', weight: '', weightUnit: 'MT', packingType: '', length: '', width: '', height: '', dimUnit: 'ft', quantity: '', isEditing: true, saveToFavorites: false }]);
                                setPickupDate('');
                                setShowForm(true);
                            }}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'var(--admin-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)'
                            }}
                        >
                            <Plus size={20} /> Book a Truck
                        </button>
                    )}
                </div>
            </div>

            {!showForm ? (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {/* Enquiry Cards List */}
                    {activeEnquiries.length > 0 ? (
                        activeEnquiries.map(enq => (
                            <div key={enq.id} style={{ background: 'var(--admin-card-bg)', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid var(--admin-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--admin-primary)', fontFamily: 'monospace', margin: 0 }}>
                                                {enq.enquiryNumber || enq.id}
                                            </h3>
                                            <span style={{ padding: '0.25rem 0.75rem', background: '#fef3c7', color: '#92400e', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600' }}>
                                                Active Enquiry
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.5rem' }}>
                                            Ref: {enq.clientRef || 'N/A'} • {enq.date}
                                        </div>

                                        {/* Expiry Countdown */}
                                        {enq.createdAt && !isEnquiryExpired(enq.createdAt) && (
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#d97706', background: '#fef3c7', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', border: '1px solid #fde68a' }}>
                                                <Clock size={12} />
                                                {getExpiryCountdown(enq.createdAt)}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleEdit(enq)}
                                            style={{ padding: '0.5rem', background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            title="Edit Enquiry"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleCancel(enq.id)}
                                            style={{ padding: '0.5rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            title="Cancel Enquiry"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Admin Style Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Route & Date</div>
                                        <div style={{ fontWeight: '600', color: 'var(--admin-text)' }}>{enq.route}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Clock size={10} />{enq.date}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Material</div>
                                        <div style={{ fontWeight: '600', color: 'var(--admin-text)' }}>
                                            {enq.materials?.[0]?.type || 'N/A'} <span style={{ color: 'var(--admin-text-light)', fontSize: '0.875rem' }}>({enq.materials?.[0]?.weight || 0} {enq.materials?.[0]?.weightUnit || 'MT'})</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Consignee</div>
                                        <div style={{ fontWeight: '600', color: 'var(--admin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={enq.drops?.[0]?.companyName || '-'}>{enq.drops?.[0]?.companyName || '-'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                            <Phone size={10} /> {enq.drops?.[0]?.phone || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Payment</div>
                                        <div style={{ fontWeight: '700', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', width: 'fit-content', background: enq.paymentBy === 'Consignee' ? '#fed7aa' : '#d1fae5', color: enq.paymentBy === 'Consignee' ? '#9a3412' : '#065f46' }}>
                                            {enq.paymentBy === 'Consignee' ? 'TO PAY' : 'PAID'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ background: 'var(--admin-card-bg)', borderRadius: '0.75rem', padding: '3rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid var(--admin-border)', textAlign: 'center' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--admin-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <Truck size={32} style={{ color: 'var(--admin-text-light)' }} />
                            </div>
                            <h3 style={{ fontWeight: '700', color: 'var(--admin-primary)', margin: '0 0 0.5rem 0' }}>No Active Enquiries</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-light)', margin: '0 0 1.5rem 0' }}>Book a truck to get started with your first shipment.</p>
                            <button
                                onClick={() => setShowForm(true)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'var(--admin-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Plus size={20} /> Book a Truck
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <button
                        onClick={() => setShowForm(false)}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'white',
                            color: 'var(--admin-text)',
                            border: '1px solid var(--admin-border)',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '1.5rem'
                        }}
                    >
                        ← Back to Enquiries
                    </button>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem', maxWidth: '1200px' }}>
                        {/* Route Details */}
                        <section className="admin-card">
                            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-primary">
                                <MapPin size={20} className="text-orange-600" />
                                Route Details
                            </h2>

                            <div className="mb-6">
                                <label className="label">Expected Pickup Date</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={pickupDate}
                                    onChange={(e) => setPickupDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                {/* Pickups */}
                                <div>
                                    <h3 className="text-sm font-bold text-secondary mb-3 uppercase tracking-wide">Pickup Points</h3>
                                    {pickups.map((p, index) => (
                                        <div key={p.id} className="mb-3 transition-all duration-300">
                                            {p.isEditing ? (
                                                <div className="p-4 border border-blue-200 rounded-md bg-white shadow-sm ring-2 ring-blue-50 relative animate-fade-in">
                                                    {pickups.length > 1 && (
                                                        <button type="button" onClick={() => removePickup(p.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}

                                                    {/* Saved Locations Dropdown */}
                                                    {savedLocations.length > 0 && (
                                                        <div className="mb-3 p-2 bg-blue-50/50 rounded flex items-center justify-between">
                                                            <span className="text-xs font-semibold text-blue-800">Fill from Saved:</span>
                                                            <select
                                                                className="select select-sm py-1 bg-white border-blue-200 text-xs w-48"
                                                                onChange={(e) => handleLoadSavedLocation(p.id, e.target.value)}
                                                                defaultValue=""
                                                            >
                                                                <option value="" disabled>Select a location</option>
                                                                {savedLocations.map((loc, idx) => (
                                                                    <option key={idx} value={loc.nickname}>{loc.nickname}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}

                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                        <div className="input-group">
                                                            <label className="label">City</label>
                                                            <input
                                                                className="input"
                                                                style={{ width: '100%' }}
                                                                placeholder="Enter City"
                                                                value={p.city}
                                                                onChange={(e) => updateItem(pickups, setPickups, p.id, 'city', e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="input-group">
                                                            <label className="label">Pincode</label>
                                                            <input
                                                                className="input"
                                                                style={{ width: '100%' }}
                                                                placeholder="000000"
                                                                value={p.pincode}
                                                                onChange={(e) => updateItem(pickups, setPickups, p.id, 'pincode', e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`save-${p.id}`}
                                                            checked={p.saveToFavorites || false}
                                                            onChange={(e) => updateItem(pickups, setPickups, p.id, 'saveToFavorites', e.target.checked)}
                                                            className="checkbox rounded text-blue-600"
                                                        />
                                                        <label htmlFor={`save-${p.id}`} className="text-sm cursor-pointer select-none">Remember this Pickup Point</label>
                                                    </div>

                                                    {p.saveToFavorites && (
                                                        <div className="mt-2 animate-fade-in">
                                                            <input
                                                                className="input"
                                                                placeholder="Give it a Nickname (e.g. Main Warehouse)"
                                                                value={p.nickname || ''}
                                                                onChange={(e) => updateItem(pickups, setPickups, p.id, 'nickname', e.target.value)}
                                                            />
                                                        </div>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => toggleEdit(pickups, setPickups, p.id, false)}
                                                        className="btn btn-primary w-full text-sm mt-3"
                                                    >
                                                        <Check size={16} /> Done
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="p-3 border border-slate-200 rounded-md bg-slate-50 flex justify-between items-center hover:bg-white hover:shadow-sm">
                                                    <div>
                                                        <div className="font-semibold text-primary">{p.city || 'Unknown City'}</div>
                                                        <div className="text-xs text-secondary">PIN: {p.pincode || 'N/A'}</div>
                                                        {p.nickname && <div className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded inline-block mt-1">{p.nickname}</div>}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button type="button" onClick={() => toggleEdit(pickups, setPickups, p.id, true)} className="p-2 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100">
                                                            <Edit2 size={14} />
                                                        </button>
                                                        {pickups.length > 1 &&
                                                            <button type="button" onClick={() => removePickup(p.id)} className="p-2 text-red-400 hover:text-red-600">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={addPickup} className="btn btn-outline text-sm w-full border-dashed">
                                        <Plus size={16} /> Add Pickup Point
                                    </button>
                                </div>

                                {/* Drops & Consignee Details */}
                                <div>
                                    <h3 className="text-sm font-bold text-secondary mb-3 uppercase tracking-wide">Drop Points & Consignee</h3>
                                    {drops.map((d, index) => (
                                        <div key={d.id} className="mb-3 transition-all duration-300">
                                            {d.isEditing ? (
                                                <div className="p-4 border border-blue-200 rounded-md bg-white shadow-sm ring-2 ring-blue-50 relative animate-fade-in">
                                                    {drops.length > 1 && (
                                                        <button type="button" onClick={() => removeDrop(d.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}

                                                    {/* Saved Drop Locations Dropdown */}
                                                    {savedDropLocations.length > 0 && (
                                                        <div className="mb-3 p-2 bg-blue-50/50 rounded flex items-center justify-between">
                                                            <span className="text-xs font-semibold text-blue-800">Fill from Saved:</span>
                                                            <select
                                                                className="select select-sm py-1 bg-white border-blue-200 text-xs w-48"
                                                                onChange={(e) => handleLoadSavedDropLocation(d.id, e.target.value)}
                                                                defaultValue=""
                                                            >
                                                                <option value="" disabled>Select a location</option>
                                                                {savedDropLocations.map((loc, idx) => (
                                                                    <option key={idx} value={loc.nickname}>{loc.nickname}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}

                                                    <div className="space-y-4">
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                            <div className="input-group">
                                                                <label className="label">City</label>
                                                                <input
                                                                    className="input"
                                                                    style={{ width: '100%' }}
                                                                    placeholder="Enter City"
                                                                    value={d.city}
                                                                    onChange={(e) => updateItem(drops, setDrops, d.id, 'city', e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="input-group">
                                                                <label className="label">Pincode</label>
                                                                <input
                                                                    className="input"
                                                                    style={{ width: '100%' }}
                                                                    placeholder="000000"
                                                                    value={d.pincode}
                                                                    onChange={(e) => updateItem(drops, setDrops, d.id, 'pincode', e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Consignee Details Per Drop */}
                                                        <div className="bg-slate-50 p-3 rounded border border-dashed border-slate-300">
                                                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Item Receiver (Consignee)</h4>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                                <div className="input-group">
                                                                    <label className="label">Company Name</label>
                                                                    <input
                                                                        className="input bg-white"
                                                                        style={{ width: '100%' }}
                                                                        placeholder="Consignee Company"
                                                                        value={d.consigneeCompany || ''}
                                                                        onChange={(e) => updateItem(drops, setDrops, d.id, 'consigneeCompany', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="input-group">
                                                                    <label className="label">Party Phone Number</label>
                                                                    <input
                                                                        className="input bg-white"
                                                                        style={{ width: '100%' }}
                                                                        placeholder="Phone Number"
                                                                        value={d.consigneePhone || ''}
                                                                        onChange={(e) => updateItem(drops, setDrops, d.id, 'consigneePhone', e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`save-drop-${d.id}`}
                                                            checked={d.saveToFavorites || false}
                                                            onChange={(e) => updateItem(drops, setDrops, d.id, 'saveToFavorites', e.target.checked)}
                                                            className="checkbox rounded text-blue-600"
                                                        />
                                                        <label htmlFor={`save-drop-${d.id}`} className="text-sm cursor-pointer select-none">Remember this Drop Point</label>
                                                    </div>

                                                    {d.saveToFavorites && (
                                                        <div className="mt-2 animate-fade-in">
                                                            <input
                                                                className="input"
                                                                placeholder="Give it a Nickname (e.g. My Client A)"
                                                                value={d.nickname || ''}
                                                                onChange={(e) => updateItem(drops, setDrops, d.id, 'nickname', e.target.value)}
                                                            />
                                                        </div>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => toggleEdit(drops, setDrops, d.id, false)}
                                                        className="btn btn-primary w-full text-sm mt-3"
                                                    >
                                                        <Check size={16} /> Done
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="p-3 border border-slate-200 rounded-md bg-slate-50 flex justify-between items-center hover:bg-white hover:shadow-sm">
                                                    <div>
                                                        <div className="font-semibold text-primary">{d.city || 'Unknown City'}</div>
                                                        <div className="text-xs text-secondary">PIN: {d.pincode || 'N/A'}</div>
                                                        {(d.consigneeCompany || d.consigneePhone) && (
                                                            <div className="text-xs text-slate-500 mt-1">
                                                                Rec: {d.consigneeCompany} {d.consigneePhone && `(${d.consigneePhone})`}
                                                            </div>
                                                        )}
                                                        {d.nickname && <div className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded inline-block mt-1">{d.nickname}</div>}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button type="button" onClick={() => toggleEdit(drops, setDrops, d.id, true)} className="p-2 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100">
                                                            <Edit2 size={14} />
                                                        </button>
                                                        {drops.length > 1 &&
                                                            <button type="button" onClick={() => removeDrop(d.id)} className="p-2 text-red-400 hover:text-red-600">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={addDrop} className="btn btn-outline text-sm w-full border-dashed">
                                        <Plus size={16} /> Add Drop Point
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Material Details */}
                        {/* Material Details */}
                        <section className="admin-card">
                            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-primary">
                                <Package size={20} className="text-purple-600" />
                                Material Details
                            </h2>

                            {materials.map((m, index) => (
                                <div key={m.id} className="mb-4 transition-all duration-300">
                                    {m.isEditing ? (
                                        <div className="p-4 border border-blue-200 rounded-md bg-white shadow-sm ring-2 ring-blue-50 animate-fade-in">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="font-bold text-sm text-blue-600 uppercase tracking-tighter">Material #{index + 1}</span>
                                                {materials.length > 1 && (
                                                    <button type="button" onClick={() => setMaterials(materials.filter(x => x.id !== m.id))} className="text-red-400">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Quick Fill Shortcuts */}
                                            {savedMaterials.length > 0 && (
                                                <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-dashed border-slate-300">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">⚡ Quick Fill from Saved Shortcuts:</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {savedMaterials.map((sm, idx) => (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => handleLoadSavedMaterial(m.id, sm.nickname)}
                                                                className="px-3 py-1.5 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-medium rounded-full border border-slate-200 hover:border-blue-300 shadow-sm transition-all flex items-center gap-1.5"
                                                            >
                                                                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                                                {sm.nickname}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="grid-2 gap-4 mb-4">
                                                <div className="input-group">
                                                    <label className="label">Material Nickname (Search existing)</label>
                                                    <input
                                                        className="input bg-blue-50/30"
                                                        list={`material-options-${m.id}`}
                                                        placeholder="e.g. My Steel Batch"
                                                        value={m.nickname}
                                                        onChange={(e) => handleLoadSavedMaterial(m.id, e.target.value)}
                                                    />
                                                    <datalist id={`material-options-${m.id}`}>
                                                        {savedMaterials.map((sm, idx) => (
                                                            <option key={idx} value={sm.nickname} />
                                                        ))}
                                                    </datalist>
                                                </div>
                                                <div className="input-group">
                                                    <label className="label">Material Type</label>
                                                    <input
                                                        className="input"
                                                        placeholder="e.g. Steel"
                                                        value={m.type}
                                                        onChange={(e) => updateItem(materials, setMaterials, m.id, 'type', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                                <div className="input-group">
                                                    <label className="label">Quantity</label>
                                                    <input
                                                        className="input"
                                                        type="number"
                                                        placeholder="Qty"
                                                        value={m.quantity}
                                                        onChange={(e) => updateItem(materials, setMaterials, m.id, 'quantity', e.target.value)}
                                                    />
                                                </div>
                                                <div className="input-group">
                                                    <label className="label">Weight</label>
                                                    <div className="flex">
                                                        <input
                                                            className="input rounded-r-none"
                                                            type="number"
                                                            placeholder="0.0"
                                                            value={m.weight}
                                                            onChange={(e) => updateItem(materials, setMaterials, m.id, 'weight', e.target.value)}
                                                        />
                                                        <select
                                                            className="select w-20 rounded-l-none bg-slate-100 border-l-0"
                                                            value={m.weightUnit}
                                                            onChange={(e) => updateItem(materials, setMaterials, m.id, 'weightUnit', e.target.value)}
                                                        >
                                                            <option value="MT">MT</option>
                                                            <option value="Kg">Kg</option>
                                                            <option value="Ltrs">Ltrs</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="input-group md:col-span-1 col-span-2">
                                                    <label className="label">Packing</label>
                                                    <input
                                                        className="input"
                                                        list={`packing-options-${m.id}`}
                                                        placeholder="Type.."
                                                        value={m.packingType}
                                                        onChange={(e) => updateItem(materials, setMaterials, m.id, 'packingType', e.target.value)}
                                                    />
                                                    <datalist id={`packing-options-${m.id}`}>
                                                        <option value="Loose" />
                                                        <option value="Box" />
                                                        <option value="Crate" />
                                                        <option value="Pallet" />
                                                        <option value="Drum" />
                                                        <option value="Bag" />
                                                    </datalist>
                                                </div>
                                            </div>

                                            <div className="input-group mb-4">
                                                <label className="label">Dimensions (L x W x H)</label>
                                                <div className="flex gap-1 mb-1">
                                                    <input
                                                        className="input px-1 text-center"
                                                        placeholder="L"
                                                        value={m.length}
                                                        onChange={(e) => updateItem(materials, setMaterials, m.id, 'length', e.target.value)}
                                                    />
                                                    <input
                                                        className="input px-1 text-center"
                                                        placeholder="W"
                                                        value={m.width}
                                                        onChange={(e) => updateItem(materials, setMaterials, m.id, 'width', e.target.value)}
                                                    />
                                                    <input
                                                        className="input px-1 text-center"
                                                        placeholder="H"
                                                        value={m.height}
                                                        onChange={(e) => updateItem(materials, setMaterials, m.id, 'height', e.target.value)}
                                                    />
                                                    <select
                                                        className="select px-1 w-20 bg-slate-100"
                                                        value={m.dimUnit}
                                                        onChange={(e) => updateItem(materials, setMaterials, m.id, 'dimUnit', e.target.value)}
                                                    >
                                                        <option value="ft">ft</option>
                                                        <option value="in">in</option>
                                                        <option value="cm">cm</option>
                                                        <option value="mm">mm</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-4">
                                                <input
                                                    type="checkbox"
                                                    id={`save-mat-${m.id}`}
                                                    checked={m.saveToFavorites || false}
                                                    onChange={(e) => updateItem(materials, setMaterials, m.id, 'saveToFavorites', e.target.checked)}
                                                    className="checkbox rounded text-blue-600"
                                                />
                                                <label htmlFor={`save-mat-${m.id}`} className="text-sm cursor-pointer select-none">Remember this Material</label>
                                            </div>

                                            {(m.length || m.width || m.height) && (
                                                <div className="p-2 bg-blue-50 rounded text-xs text-blue-800 text-center font-mono">
                                                    ≈ {convertToFeet(m.length, m.dimUnit)} ft x {convertToFeet(m.width, m.dimUnit)} ft x {convertToFeet(m.height, m.dimUnit)} ft
                                                </div>
                                            )}


                                            <button
                                                type="button"
                                                onClick={() => toggleEdit(materials, setMaterials, m.id, false)}
                                                className="btn btn-primary w-full text-sm mt-2"
                                            >
                                                <Check size={16} /> Save Material
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-4 border border-slate-200 rounded-md bg-white hover:shadow-md flex justify-between items-center transition-shadow">
                                            <div>
                                                <div className="font-bold text-primary flex items-center gap-2">
                                                    {m.nickname || m.type || 'Unnamed Material'}
                                                    {m.quantity && <span className="badge badge-yellow text-[10px]">{m.quantity} Qty</span>}
                                                </div>
                                                <div className="text-xs text-secondary mt-1">
                                                    {m.weight ? `${m.weight} ${m.weightUnit}` : 'N/A'} • {m.packingType || 'Loose'}
                                                </div>
                                                {(m.length || m.width || m.height) && (
                                                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                                                        {convertToFeet(m.length, m.dimUnit)}x{convertToFeet(m.width, m.dimUnit)}x{convertToFeet(m.height, m.dimUnit)} ft
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => toggleEdit(materials, setMaterials, m.id, true)} className="p-2 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100">
                                                    <Edit2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addMaterial} className="btn btn-outline text-sm border-dashed">
                                <Plus size={16} /> Add Material
                            </button>
                        </section>

                        {/* Truck Preference */}
                        <section className="admin-card">
                            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-primary">
                                <Truck size={20} className="text-emerald-500" />
                                Truck Preferences
                            </h2>

                            <div className="flex gap-6 mb-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="loadType"
                                        value="FTL"
                                        checked={loadType === 'FTL'}
                                        onChange={(e) => setLoadType(e.target.value)}
                                        className="accent-blue-600 w-5 h-5"
                                    />
                                    <span className="font-medium">Full Truck Load (FTL)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="loadType"
                                        value="PTL"
                                        checked={loadType === 'PTL'}
                                        onChange={(e) => setLoadType(e.target.value)}
                                        className="accent-blue-600 w-5 h-5"
                                    />
                                    <span className="font-medium">Part Load (PTL)</span>
                                </label>
                            </div>

                            <div className="p-4 bg-slate-50 border border-dashed rounded text-secondary text-sm animate-fade-in">
                                For both FTL and Part Loads, our transport admin will allocate the most suitable vehicle based on your material weight and dimensions.
                            </div>
                        </section>

                        {/* Payment By Selection */}
                        <section className="admin-card">
                            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-primary">
                                <IndianRupee size={20} className="text-emerald-500" />
                                Payment Responsibility
                            </h2>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentBy"
                                        value="Consignor"
                                        checked={paymentBy === 'Consignor'}
                                        onChange={(e) => setPaymentBy(e.target.value)}
                                        className="accent-blue-600 w-5 h-5"
                                    />
                                    <span className="font-medium">Paid by Consignor (Sender)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentBy"
                                        value="Consignee"
                                        checked={paymentBy === 'Consignee'}
                                        onChange={(e) => setPaymentBy(e.target.value)}
                                        className="accent-blue-600 w-5 h-5"
                                    />
                                    <span className="font-medium">Paid by Consignee (Receiver)</span>
                                </label>
                            </div>
                        </section>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)' }}>
                                Submit Enquiry
                            </button>
                        </div>
                    </form >
                </div >
            )
            }
        </div >
    );
};

export default BookTruck;
