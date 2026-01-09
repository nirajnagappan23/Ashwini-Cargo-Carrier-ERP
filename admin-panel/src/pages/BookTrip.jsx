import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { ArrowLeft, Plus, Trash2, Truck, MapPin, Package, Edit2, Check, User, DollarSign, Calculator, FileText } from 'lucide-react';
import { generateOrderNumber, formatDate } from '../utils/numberingSystem';
import './BookTrip.css';


const BookTrip = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addOrder, updateOrderDetails, clients, orders } = useAdmin();
    const editingEnquiry = location.state?.editingEnquiry;
    const mode = location.state?.mode || (editingEnquiry ? 'edit-enquiry' : 'create-trip'); // Default to edit if enquiry passed but no mode context, or explicit mode
    const isEditing = !!editingEnquiry;
    const isEnquiryEdit = mode === 'edit-enquiry';

    useEffect(() => {
        if (editingEnquiry) {
            setLrNumber(editingEnquiry.lrNumber || '');
            setPickupDate(editingEnquiry.pickupDate || editingEnquiry.date || '');

            // Set locations
            if (editingEnquiry.pickups) {
                setPickups(editingEnquiry.pickups.map(p => ({ ...p, isEditing: true })));
            } else if (editingEnquiry.consignor) {
                setPickups([{ id: 1, city: editingEnquiry.route?.split('->')[0]?.trim() || '', pincode: '', address: editingEnquiry.consignor.address, isEditing: true }]);
            }

            // Set Drops
            if (editingEnquiry.drops && editingEnquiry.drops.length > 0) {
                setDrops(editingEnquiry.drops.map((d, i) => ({ ...d, id: i + 1, isEditing: true })));
            } else {
                setDrops([{ id: 1, city: editingEnquiry.route?.split('->')[1]?.trim() || '', pincode: '', companyName: editingEnquiry.consignee?.companyName || '', isEditing: true }]);
            }

            // Set Materials
            if (editingEnquiry.materials) {
                setMaterials(editingEnquiry.materials.map((m, i) => ({
                    ...m,
                    id: i + 1,
                    length: m.dimensions?.split('x')[0] || '',
                    width: m.dimensions?.split('x')[1] || '',
                    height: m.dimensions?.split('x')[2]?.split(' ')[0] || '',
                    dimUnit: m.dimensions?.split(' ')[1] || 'ft',
                    isEditing: true
                })));
            }

            // Set Client
            setClientDetails({
                name: editingEnquiry.clientName || '',
                phone: editingEnquiry.clientPhone || '',
                email: editingEnquiry.clientEmail || ''
            });

            // Set Financials
            if (editingEnquiry.quoteBreakdown) {
                setFinancials(prev => ({
                    ...prev,
                    freightAmount: editingEnquiry.quoteBreakdown.freightAmount,
                    loadingCharges: editingEnquiry.quoteBreakdown.loadingCharges,
                    unloadingCharges: editingEnquiry.quoteBreakdown.unloadingCharges,
                    haltingCharges: editingEnquiry.quoteBreakdown.haltingCharges,
                    otherCharges: editingEnquiry.quoteBreakdown.customCharges || [],
                    advance: editingEnquiry.advance,
                    balance: editingEnquiry.balance,
                    paymentBy: editingEnquiry.paymentBy
                }));
            }
        }
    }, [editingEnquiry]);

    // --- New Fields ---
    const [lrNumber, setLrNumber] = useState('');
    const [selectedEnquiryId, setSelectedEnquiryId] = useState('');

    // Truck Allocation
    const [truckDetails, setTruckDetails] = useState({
        truckNo: '',
        driverPhone: '',
        truckType: ''
    });

    // Saved Truck Types (Custom + History)
    const [savedTruckTypes, setSavedTruckTypes] = useState(() => {
        const saved = localStorage.getItem('adminSavedTruckTypes');
        return saved ? JSON.parse(saved) : ['Open Body', 'Container', 'Trailer', 'Tanker', 'Refrigerated', 'Flatbed'];
    });

    // Admin Specific State: Client Details
    const [clientDetails, setClientDetails] = useState({
        name: '',
        phone: '',
        email: ''
    });


    // --- FROM CLIENT DASHBOARD (BookTruck.jsx) ---
    const [pickupDate, setPickupDate] = useState('');

    // Saved Locations State (Admin LocalStorage)
    const [savedLocations, setSavedLocations] = useState(() => {
        const saved = localStorage.getItem('adminSavedPickupLocations');
        return saved ? JSON.parse(saved) : [];
    });
    const [savedDropLocations, setSavedDropLocations] = useState(() => {
        const saved = localStorage.getItem('adminSavedDropLocations');
        return saved ? JSON.parse(saved) : [];
    });
    const [savedMaterials, setSavedMaterials] = useState(() => {
        const saved = localStorage.getItem('adminSavedMaterials');
        return saved ? JSON.parse(saved) : [];
    });

    // Pickups State
    const [pickups, setPickups] = useState([
        { id: 1, city: '', pincode: '', isEditing: true, saveToFavorites: false, nickname: '' }
    ]);

    // Drops State (Modified: Includes Consignee Details)
    const [drops, setDrops] = useState([
        {
            id: 1,
            city: '',
            pincode: '',
            companyName: '',
            phone: '',
            isEditing: true,
            saveToFavorites: false,
            nickname: ''
        }
    ]);

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

    // Financials State
    const [financials, setFinancials] = useState({
        freightAmount: '',
        loadingCharges: '',
        unloadingCharges: '',
        haltingCharges: '',
        otherCharges: [], // Array of { name: '', amount: '' }
        advance: '',
        balance: '',
        paymentBy: 'Consignor' // Default
    });

    const [totalFreight, setTotalFreight] = useState(0);

    // Effect to calculate Total Freight
    useEffect(() => {
        const base = parseFloat(financials.freightAmount) || 0;
        const loading = parseFloat(financials.loadingCharges) || 0;
        const unloading = parseFloat(financials.unloadingCharges) || 0;
        const halting = parseFloat(financials.haltingCharges) || 0;
        const others = financials.otherCharges.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

        const total = base + loading + unloading + halting + others;
        setTotalFreight(total);

        // Update Balance
        const advance = parseFloat(financials.advance) || 0;
        setFinancials(prev => ({ ...prev, balance: total - advance }));
    }, [financials.freightAmount, financials.loadingCharges, financials.unloadingCharges, financials.haltingCharges, financials.otherCharges, financials.advance]);

    // Handle Enquiry Selection
    const handleEnquirySelect = (e) => {
        const enquiryId = e.target.value;
        setSelectedEnquiryId(enquiryId);

        const enquiry = orders.find(o => o.id === enquiryId);
        if (enquiry) {
            // Auto-fill form
            if (enquiry.clientName) {
                // Try to find client in clients list first to get consistent data
                const existingClient = clients.find(c => c.name === enquiry.clientName) || {
                    name: enquiry.clientName,
                    phone: enquiry.clientPhone || '',
                    email: enquiry.clientEmail || ''
                };
                setClientDetails(existingClient);
            }

            if (enquiry.pickupDate) setPickupDate(enquiry.pickupDate);
            if (enquiry.pickups) setPickups(enquiry.pickups.map(p => ({ ...p, isEditing: false })));
            if (enquiry.drops) setDrops(enquiry.drops.map(d => ({ ...d, isEditing: false }))); // Note: Enquiry drops might not have company details yet, which is fine
            if (enquiry.materials) setMaterials(enquiry.materials.map(m => ({ ...m, isEditing: false })));
            if (enquiry.loadType) setLoadType(enquiry.loadType);
        }
    };

    // Handle Client Selection
    const handleClientSelect = (e) => {
        const clientName = e.target.value;
        const selectedClient = clients.find(c => c.name === clientName);
        if (selectedClient) {
            setClientDetails({
                name: selectedClient.name,
                phone: selectedClient.phone,
                email: selectedClient.email
            });
        } else {
            setClientDetails({ name: '', phone: '', email: '' });
        }
    };

    // --- Helpers ---
    const toggleEdit = (list, setList, id, isEditing) => {
        setList(list.map(item => item.id === id ? { ...item, isEditing } : item));
    };

    const updateItem = (list, setList, id, field, value) => {
        setList(list.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addPickup = () => {
        const newId = pickups.length + 1;
        const collapsed = pickups.map(p => ({ ...p, isEditing: false }));
        setPickups([...collapsed, { id: newId, city: '', pincode: '', isEditing: true, saveToFavorites: false, nickname: '' }]);
    };

    const removePickup = (id) => {
        if (pickups.length > 1) setPickups(pickups.filter(p => p.id !== id));
    };

    const addDrop = () => {
        const newId = drops.length + 1;
        const collapsed = drops.map(d => ({ ...d, isEditing: false }));
        setDrops([...collapsed, { id: newId, city: '', pincode: '', isEditing: true, saveToFavorites: false, nickname: '' }]);
    };

    const removeDrop = (id) => {
        if (drops.length > 1) setDrops(drops.filter(d => d.id !== id));
    };

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

    // --- Handlers ---
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
            updateItem(materials, setMaterials, id, 'nickname', materialNickname);
        }
    };

    const addOtherCharge = () => {
        setFinancials({ ...financials, otherCharges: [...financials.otherCharges, { name: '', amount: '' }] });
    };

    const updateOtherCharge = (index, field, value) => {
        const updated = [...financials.otherCharges];
        updated[index][field] = value;
        setFinancials({ ...financials, otherCharges: updated });
    };

    const removeOtherCharge = (index) => {
        setFinancials({ ...financials, otherCharges: financials.otherCharges.filter((_, i) => i !== index) });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!lrNumber.trim()) {
            alert("Please provide the LR Number.");
            return;
        }

        // 1. Save Locations and Matches (Existing Logic)
        pickups.forEach(p => {
            if (p.saveToFavorites && p.nickname && p.city) {
                const newLocation = { nickname: p.nickname, city: p.city, pincode: p.pincode };
                const exists = savedLocations.find(l => l.nickname === p.nickname);
                if (!exists) {
                    const newSaved = [...savedLocations, newLocation];
                    setSavedLocations(newSaved);
                    localStorage.setItem('adminSavedPickupLocations', JSON.stringify(newSaved));
                }
            }
        });

        drops.forEach(d => {
            if (d.saveToFavorites && d.nickname && d.city) {
                const newLocation = { nickname: d.nickname, city: d.city, pincode: d.pincode };
                const exists = savedDropLocations.find(l => l.nickname === d.nickname);
                if (!exists) {
                    const newSaved = [...savedDropLocations, newLocation];
                    setSavedDropLocations(newSaved);
                    localStorage.setItem('adminSavedDropLocations', JSON.stringify(newSaved));
                }
            }
        });

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
                    localStorage.setItem('adminSavedMaterials', JSON.stringify(newSaved));
                }
            }
        });

        // 2. Save Truck Type (New)
        if (truckDetails.truckType && !savedTruckTypes.includes(truckDetails.truckType)) {
            const newTypes = [...savedTruckTypes, truckDetails.truckType];
            setSavedTruckTypes(newTypes);
            localStorage.setItem('adminSavedTruckTypes', JSON.stringify(newTypes));
        }

        // 3. Prepare Data for 'addOrder'
        const fromCity = pickups[0]?.city || 'Unknown';
        const toCity = drops[0]?.city || 'Unknown';

        // Auto-generate order number
        const orderNumber = generateOrderNumber();
        const currentDate = formatDate();

        const newOrder = {
            // Numbering System
            lrNumber: lrNumber.toUpperCase(),
            orderNumber: orderNumber,              // Auto-generated: ORD-XXX/MMM-YY
            enquiryNumber: selectedEnquiryId || null, // Link to enquiry if selected
            orderId: lrNumber.toUpperCase(),       // Legacy field
            linkedEnquiryId: selectedEnquiryId || null,

            clientName: clientDetails.name,
            clientPhone: clientDetails.phone,
            clientEmail: clientDetails.email,
            clientRef: 'Confirmed by Admin',

            route: `${fromCity} -> ${toCity}`,
            date: pickupDate || new Date().toISOString().split('T')[0],
            orderDate: currentDate,
            status: 'Confirmed', // Direct Confirmation

            pickups: pickups.map(p => ({ city: p.city, pincode: p.pincode })),


            // Drops with Consignee Info
            drops: drops.map(d => ({
                city: d.city,
                pincode: d.pincode,
                companyName: d.companyName, // Consignee info per drop
                phone: d.phone
            })),

            // Flattened/Stubbed for legacy compatibility if needed
            consignor: { name: '', phone: '' },
            consignee: {
                companyName: drops[0]?.companyName || '',
                name: '',
                phone: drops[0]?.phone || ''
            },

            materials: materials.map(m => ({
                type: m.type,
                weight: m.weight,
                weightUnit: m.weightUnit,
                quantity: m.quantity,
                packingType: m.packingType,
                dimensions: `${m.length || 0}x${m.width || 0}x${m.height || 0} ${m.dimUnit}`
            })),

            // Truck Info
            loadType,
            truckDetails: truckDetails,

            // Financials
            quoteAmount: totalFreight,
            totalFreight: totalFreight,
            advance: parseFloat(financials.advance) || 0,
            balance: parseFloat(financials.balance) || 0,
            paymentBy: financials.paymentBy,
            paymentMode: financials.paymentBy === 'Consignee' ? 'To Pay' : 'Paid',
            quoteBreakdown: {
                freightAmount: parseFloat(financials.freightAmount) || 0,
                loadingCharges: parseFloat(financials.loadingCharges) || 0,
                unloadingCharges: parseFloat(financials.unloadingCharges) || 0,
                haltingCharges: parseFloat(financials.haltingCharges) || 0,
                customCharges: financials.otherCharges.map(c => ({ name: c.name, amount: parseFloat(c.amount) || 0 }))
            },

            tripStatus: 'Loading' // Start flow
        };

        if (isEnquiryEdit) {
            updateOrderDetails(editingEnquiry.id, newOrder);
            alert("Enquiry Updated Successfully!");
            navigate('/enquiries');
        } else {
            addOrder(newOrder);
            alert(`Trip Created Successfully! LR: ${newOrder.lrNumber}`);
            navigate('/trips');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', paddingBottom: '5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate(-1)}
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
                        marginBottom: '1rem'
                    }}
                >
                    <ArrowLeft size={16} /> Back
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
                        <Truck size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--admin-primary)', margin: 0 }}>
                            {isEnquiryEdit ? 'Edit Enquiry Details' : 'Book New Trip'}
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-light)', margin: '0.25rem 0 0 0' }}>
                            {isEnquiryEdit ? 'Update the details of the selected enquiry.' : 'Create a confirmed trip order directly.'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem', maxWidth: '1200px' }}>

                {/* 0. Primary Details (LR & Enquiry) */}
                {/* 0. Primary Details (LR & Enquiry) - Hide in Enquiry Edit Mode */}
                {!isEnquiryEdit && (
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-indigo-600" />
                            Trip Reference
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="input-group">
                                <label className="label text-indigo-900 font-semibold">LR Number (Unique Trip ID) *</label>
                                <input
                                    className="input text-lg font-mono font-bold tracking-wide border-indigo-200 focus:border-indigo-500 focus:ring-indigo-100"
                                    placeholder="19878"
                                    value={lrNumber}
                                    onChange={e => setLrNumber(e.target.value)}
                                    required={!isEnquiryEdit}
                                />
                                {/* Order Number Preview */}
                                <div style={{
                                    marginTop: '0.5rem',
                                    padding: '0.5rem 0.75rem',
                                    background: '#f0f9ff',
                                    border: '1px solid #bae6fd',
                                    borderRadius: '0.375rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <FileText size={14} style={{ color: '#0284c7' }} />
                                    <span style={{ fontSize: '0.75rem', color: '#0369a1' }}>
                                        Order Number: <strong style={{ fontFamily: 'monospace' }}>{generateOrderNumber()}</strong>
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Order number will be auto-generated when you submit
                                </p>
                            </div>
                            <div className="input-group">

                                <label className="label">Tag an Enquiry (Optional)</label>
                                <select
                                    className="select border-indigo-200"
                                    value={selectedEnquiryId}
                                    onChange={handleEnquirySelect}
                                >
                                    <option value="">-- Create Fresh Order --</option>
                                    {orders.filter(o => o.status !== 'Confirmed' && o.status !== 'Rejected' && o.status !== 'Cancelled').map(enq => (
                                        <option key={enq.id} value={enq.id}>
                                            {enq.id} - {enq.clientName} ({enq.route})
                                        </option>
                                    ))}
                                </select>
                                {selectedEnquiryId && (
                                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                        <Check size={12} /> Linked to Enquiry {selectedEnquiryId}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* 1. Client Details (Admin Only) */}
                <section className="admin-card">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                        <User size={20} className="text-blue-600" />
                        Client Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="input-group">
                            <label className="label">Select Client *</label>
                            <select
                                className="select"
                                value={clientDetails.name}
                                onChange={handleClientSelect}
                                required
                            >
                                <option value="" disabled>Select a Client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.name}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="label">Client Phone</label>
                            <input
                                className="input bg-slate-100" // Read-only look
                                placeholder="+91..."
                                value={clientDetails.phone}
                                readOnly
                            />
                        </div>
                        <div className="input-group">
                            <label className="label">Client Email</label>
                            <input
                                className="input bg-slate-100" // Read-only look
                                placeholder="client@example.com"
                                value={clientDetails.email}
                                readOnly
                            />
                        </div>
                    </div>
                </section>

                {/* 1. Route Details */}
                <section className="admin-card">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                        <MapPin size={20} className="text-orange-600" />
                        Route Details
                    </h2>

                    <div className="mb-6">
                        <label className="label">Expected Pickup Date</label>
                        <input
                            type="date"
                            className="input w-full md:w-1/3"
                            value={pickupDate}
                            onChange={(e) => setPickupDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="input-group">
                                                    <label className="label">City</label>
                                                    <input
                                                        className="input"
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

                        {/* Consignor Details Removed as per requirement */}

                        {/* Drops */}
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

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="input-group">
                                                    <label className="label">City</label>
                                                    <input
                                                        className="input"
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
                                                        placeholder="000000"
                                                        value={d.pincode}
                                                        onChange={(e) => updateItem(drops, setDrops, d.id, 'pincode', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Consignee Details Inline */}
                                            <div className="bg-slate-50 p-3 rounded border border-dashed border-slate-300 mb-3">
                                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Item Receiver (Consignee)</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="input-group">
                                                        <label className="label">Company Name</label>
                                                        <input
                                                            className="input bg-white"
                                                            placeholder="Consignee Company"
                                                            value={d.companyName || ''}
                                                            onChange={(e) => updateItem(drops, setDrops, d.id, 'companyName', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="input-group">
                                                        <label className="label">Party Phone Number</label>
                                                        <input
                                                            className="input bg-white"
                                                            placeholder="Phone Number"
                                                            value={d.phone || ''}
                                                            onChange={(e) => updateItem(drops, setDrops, d.id, 'phone', e.target.value)}
                                                        />
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
                                                {(d.companyName || d.phone) && (
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        Rec: {d.companyName} {d.phone && `(${d.phone})`}
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

                        {/* Consignee Details Removed */}
                    </div>
                </section>

                {/* 2. Material Details */}
                <section className="admin-card">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                                        {(m.length || m.width || m.height) && (
                                            <div className="p-2 bg-blue-50 rounded text-xs text-blue-800 text-center font-mono">
                                                ≈ {convertToFeet(m.length, m.dimUnit)} ft x {convertToFeet(m.width, m.dimUnit)} ft x {convertToFeet(m.height, m.dimUnit)} ft
                                            </div>
                                        )}
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

                                    <button
                                        type="button"
                                        onClick={() => toggleEdit(materials, setMaterials, m.id, false)}
                                        className="btn btn-primary w-full text-sm"
                                    >
                                        <Check size={16} /> Save Material
                                    </button>
                                </div>
                            ) : (
                                <div className="p-3 border border-slate-200 rounded-md bg-white flex justify-between items-center hover:shadow-md transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 rounded text-slate-500">
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-primary">{m.type || 'Unknown Material'} {m.nickname && `(${m.nickname})`}</div>
                                            <div className="text-xs text-secondary">{m.weight} {m.weightUnit} • {m.quantity} Qty</div>
                                            {(m.length || m.width || m.height) && (
                                                <div className="text-[10px] text-slate-400 font-mono mt-1">
                                                    {convertToFeet(m.length, m.dimUnit)}x{convertToFeet(m.width, m.dimUnit)}x{convertToFeet(m.height, m.dimUnit)} ft
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => toggleEdit(materials, setMaterials, m.id, true)} className="p-2 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100">
                                            <Edit2 size={14} />
                                        </button>
                                        {materials.length > 1 &&
                                            <button type="button" onClick={() => setMaterials(materials.filter(x => x.id !== m.id))} className="p-2 text-red-400 hover:text-red-600">
                                                <Trash2 size={14} />
                                            </button>
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addMaterial} className="btn btn-outline text-sm w-full border-dashed">
                        <Plus size={16} /> Add More Material
                    </button>
                </section>

                {/* 3. Truck Preference */}
                {/* 3. Truck Preference - Hide in Enquiry Edit Mode */}
                <section className="admin-card">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                        <Truck size={20} className="text-indigo-600" />
                        Truck Load Type
                    </h2>

                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors w-full">
                            <input
                                type="radio"
                                name="loadType"
                                value="FTL"
                                checked={loadType === 'FTL'}
                                onChange={() => setLoadType('FTL')}
                                className="radio text-indigo-600"
                            />
                            <span className="font-medium text-indigo-900">Full Truck Load (FTL)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors w-full">
                            <input
                                type="radio"
                                name="loadType"
                                value="PTL"
                                checked={loadType === 'PTL'}
                                onChange={() => setLoadType('PTL')}
                                className="radio text-indigo-600"
                            />
                            <span className="font-medium text-indigo-900">Part Truck Load (PTL)</span>
                        </label>
                    </div>
                </section>

                {/* 3.5 Truck Assignment (Admin Only) */}
                {!isEnquiryEdit && (
                    <section className="admin-card border-l-4 border-l-orange-500">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                            <Truck size={20} className="text-orange-600" />
                            Truck & Driver Allocation
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="input-group">
                                <label className="label">Truck Number (RC)</label>
                                <input
                                    className="input uppercase font-mono"
                                    placeholder="KA-01-AB-1234"
                                    value={truckDetails.truckNo}
                                    onChange={(e) => setTruckDetails({ ...truckDetails, truckNo: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="input-group">
                                <label className="label">Driver Phone Number</label>
                                <input
                                    className="input"
                                    placeholder="+91..."
                                    value={truckDetails.driverPhone}
                                    onChange={(e) => setTruckDetails({ ...truckDetails, driverPhone: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label className="label">Truck Type</label>
                                <input
                                    className="input"
                                    list="truck-type-options"
                                    placeholder="e.g. 32ft Container"
                                    value={truckDetails.truckType}
                                    onChange={(e) => setTruckDetails({ ...truckDetails, truckType: e.target.value })}
                                />
                                <datalist id="truck-type-options">
                                    {savedTruckTypes.map(type => (
                                        <option key={type} value={type} />
                                    ))}
                                </datalist>
                            </div>
                        </div>
                    </section>
                )}

                {/* 4. Payment & Freight Details (Admin Only) */}
                <section className="admin-card border-l-4 border-l-green-500">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                        <DollarSign size={20} className="text-green-600" />
                        Payment & Freight Details
                    </h2>

                    {/* Payment By Selection */}
                    <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
                        <label className="text-sm font-bold text-slate-700 mb-2 block">Who is responsible for Payment?</label>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="paymentBy"
                                    value="Consignor"
                                    checked={financials.paymentBy === 'Consignor'}
                                    onChange={(e) => setFinancials({ ...financials, paymentBy: e.target.value })}
                                    className="radio text-green-600"
                                />
                                <span className="font-medium text-slate-700">Consignor (Sender)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="paymentBy"
                                    value="Consignee"
                                    checked={financials.paymentBy === 'Consignee'}
                                    onChange={(e) => setFinancials({ ...financials, paymentBy: e.target.value })}
                                    className="radio text-green-600"
                                />
                                <span className="font-medium text-slate-700">Consignee (Receiver)</span>
                            </label>
                        </div>
                    </div>

                    {!isEnquiryEdit && (
                        <>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="input-group">
                                    <label className="label font-bold text-slate-700">Base Freight Amount</label>
                                    <input
                                        className="input text-lg font-bold"
                                        type="number"
                                        placeholder="0.00"
                                        value={financials.freightAmount}
                                        onChange={(e) => setFinancials({ ...financials, freightAmount: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="input-group">
                                    <label className="label">Loading Charges</label>
                                    <input
                                        className="input"
                                        type="number"
                                        placeholder="0"
                                        value={financials.loadingCharges}
                                        onChange={(e) => setFinancials({ ...financials, loadingCharges: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="label">Unloading Charges</label>
                                    <input
                                        className="input"
                                        type="number"
                                        placeholder="0"
                                        value={financials.unloadingCharges}
                                        onChange={(e) => setFinancials({ ...financials, unloadingCharges: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="label">Halting Charges</label>
                                    <input
                                        className="input"
                                        type="number"
                                        placeholder="0"
                                        value={financials.haltingCharges}
                                        onChange={(e) => setFinancials({ ...financials, haltingCharges: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Other Charges */}
                            <div className="mb-4">
                                <label className="label mb-2">Other Charges</label>
                                {financials.otherCharges.map((charge, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input
                                            className="input flex-1"
                                            placeholder="Charge Name"
                                            value={charge.name}
                                            onChange={(e) => updateOtherCharge(idx, 'name', e.target.value)}
                                        />
                                        <input
                                            className="input w-32"
                                            type="number"
                                            placeholder="Amount"
                                            value={charge.amount}
                                            onChange={(e) => updateOtherCharge(idx, 'amount', e.target.value)}
                                        />
                                        <button type="button" onClick={() => removeOtherCharge(idx)} className="btn btn-ghost text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={addOtherCharge} className="text-sm text-blue-600 font-medium hover:underline">
                                    + Add Other Charge
                                </button>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                                <div className="flex justify-between items-center text-lg font-bold text-slate-800">
                                    <span>Total Freight Amount</span>
                                    <span>₹{totalFreight.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="input-group">
                                    <label className="label">Advance Received</label>
                                    <input
                                        className="input"
                                        type="number"
                                        placeholder="0"
                                        value={financials.advance}
                                        onChange={(e) => setFinancials({ ...financials, advance: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="label">Balance Pending</label>
                                    <input
                                        className="input bg-slate-100"
                                        type="number"
                                        value={financials.balance}
                                        readOnly
                                    />
                                </div>
                            </div>

                        </>
                    )}
                </section>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                    <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost">Cancel</button>
                    <button type="submit" className="btn btn-primary px-8 bg-green-600 hover:bg-green-700 border-green-600">
                        <Check size={18} /> {isEnquiryEdit ? 'Update Enquiry' : 'Create Confirmed Trip'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookTrip;
