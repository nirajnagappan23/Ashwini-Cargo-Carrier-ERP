import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AppContext = createContext();
const ENQUIRY_META_TYPE = 'enquiry_meta';

const stripUndefined = (obj) => {
    Object.keys(obj).forEach((key) => {
        if (obj[key] === undefined) delete obj[key];
    });
    return obj;
};

const normalizeDrops = (drops = []) =>
    (drops || []).map((d) => ({
        ...d,
        companyName: d.companyName || d.consigneeCompany || '',
        phone: d.phone || d.consigneePhone || '',
        consigneeCompany: d.consigneeCompany || d.companyName || '',
        consigneePhone: d.consigneePhone || d.phone || '',
    }));

const extractEnquiryMeta = (documents = []) => {
    const meta = (documents || []).find((d) => d?.type === ENQUIRY_META_TYPE);
    if (!meta) return {};
    const { type, id, name, date, url, ...rest } = meta;
    return rest;
};

const withEnquiryMetaDoc = (documents = [], meta = {}) => {
    const others = (documents || []).filter((d) => d?.type !== ENQUIRY_META_TYPE);
    const hasMeta = Object.values(meta).some((v) => v !== undefined && v !== null && v !== '');
    if (!hasMeta) return others;
    return [
        {
            id: '__enquiry_meta__',
            type: ENQUIRY_META_TYPE,
            name: 'Enquiry Meta',
            ...meta,
        },
        ...others,
    ];
};

export const AppProvider = ({ children }) => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chats, setChats] = useState([]);

    // ---- MAPPERS ----

    const mapDbOrderToApp = (dbOrder) => {
        if (!dbOrder) return null;
        const documents = dbOrder.documents || [];
        const meta = extractEnquiryMeta(documents);
        const origin = dbOrder.origin || meta.origin || '';
        const destination = dbOrder.destination || meta.destination || '';

        return {
            ...dbOrder,
            ...meta,
            orderId: dbOrder.order_id,
            orderDate: dbOrder.order_date,
            clientRef: dbOrder.client_ref,
            clientName: dbOrder.client_name,
            clientPhone: dbOrder.client_phone,
            clientEmail: dbOrder.client_email,
            tripStatus: dbOrder.trip_status,
            vehicleType: dbOrder.vehicle_type,
            totalFreight: dbOrder.total_freight,
            quoteAmount: dbOrder.quote_amount,
            clientPrice: dbOrder.client_price,
            payType: dbOrder.pay_type,
            paymentMode: dbOrder.payment_mode,
            trackingHistory: dbOrder.tracking_history || [],
            paymentHistory: dbOrder.payment_history || [],
            truckPaymentHistory: dbOrder.truck_payment_history || [],
            truckExpenses: dbOrder.truck_expenses || [],
            documents,
            chats: dbOrder.chats || [],
            route:
                meta.route ||
                dbOrder.route ||
                (origin && destination ? `${origin} -> ${destination}` : 'Unknown Route'),
            status: dbOrder.status || (dbOrder.trip_status ? 'Confirmed' : 'Requested'),
            lrNumber: dbOrder.lr_number || dbOrder.id,
            enquiryNumber: meta.enquiryNumber || dbOrder.order_id || dbOrder.id,
            pickupDate: meta.pickupDate || dbOrder.order_date || '',
            paymentBy: meta.paymentBy || dbOrder.pay_type || 'Consignor',
            loadType: meta.loadType || 'FTL',
            requestedTrucks: meta.requestedTrucks || [],
            expiresAt: meta.expiresAt || null,
            createdAt: meta.createdAt || dbOrder.created_at,
            pickups: dbOrder.pickups || [],
            drops: normalizeDrops(dbOrder.drops || []),
            materials: dbOrder.materials || [],
            consignments: dbOrder.consignments || [],
        };
    };

    const mapAppOrderToDb = (appOrder) => {
        const origin =
            appOrder.origin ||
            appOrder.pickups?.[0]?.city ||
            (appOrder.route ? String(appOrder.route).split('->')[0]?.trim() : undefined);
        const destination =
            appOrder.destination ||
            appOrder.drops?.[0]?.city ||
            (appOrder.route ? String(appOrder.route).split('->')[1]?.trim() : undefined);

        const meta = {
            enquiryNumber: appOrder.enquiryNumber,
            pickupDate: appOrder.pickupDate,
            expiresAt: appOrder.expiresAt,
            loadType: appOrder.loadType,
            requestedTrucks: appOrder.requestedTrucks,
            paymentBy: appOrder.paymentBy,
            route: appOrder.route || (origin && destination ? `${origin} -> ${destination}` : undefined),
            createdAt: appOrder.createdAt || appOrder.created_at,
            origin,
            destination,
        };

        return stripUndefined({
            id: appOrder.id,
            order_id: appOrder.enquiryNumber || appOrder.orderId || appOrder.id,
            order_date: appOrder.pickupDate || appOrder.orderDate || appOrder.createdAt,
            client_ref: appOrder.clientRef,
            client_name: appOrder.clientName,
            client_phone: appOrder.clientPhone,
            client_email: appOrder.clientEmail,
            origin,
            destination,
            trip_status: appOrder.tripStatus,
            status: appOrder.status,
            vehicle_type: appOrder.vehicleType || appOrder.loadType,
            total_freight: appOrder.totalFreight,
            quote_amount: appOrder.quoteAmount,
            client_price: appOrder.clientPrice,
            pay_type: appOrder.paymentBy || appOrder.payType,
            payment_mode: appOrder.paymentMode,
            tracking_history: appOrder.trackingHistory,
            documents: withEnquiryMetaDoc(appOrder.documents, meta),
            chats: appOrder.chats,
            pickups: appOrder.pickups,
            drops: normalizeDrops(appOrder.drops),
            materials: appOrder.materials,
            consignments: appOrder.consignments,
            created_at: appOrder.created_at || appOrder.createdAt || new Date().toISOString(),
        });
    };

    const refreshEnquiries = async () => {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setEnquiries((data || []).map(mapDbOrderToApp).filter(Boolean));
        return data;
    };

    // Initial Data Fetch
    useEffect(() => {
        const fetchClientData = async () => {
            try {
                await refreshEnquiries();
            } catch (e) {
                console.error('Client Data Fetch Error:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchClientData();
    }, []);

    const addEnquiry = async (enquiryData) => {
        const clientName = enquiryData.clientName || localStorage.getItem('clientName') || '';
        const clientEmail = enquiryData.clientEmail || localStorage.getItem('clientEmail') || '';
        const clientPhone = enquiryData.clientPhone || localStorage.getItem('clientPhone') || '';
        const clientUserId = enquiryData.clientUserId || localStorage.getItem('clientUserId') || '';

        const origin = enquiryData.origin || enquiryData.pickups?.[0]?.city || '';
        const destination = enquiryData.destination || enquiryData.drops?.[0]?.city || '';

        const newEnquiry = {
            id: `ENQ-${Date.now()}`,
            ...enquiryData,
            clientName,
            clientEmail,
            clientPhone,
            clientRef: clientUserId || enquiryData.clientRef,
            origin,
            destination,
            route: enquiryData.route || (origin && destination ? `${origin} -> ${destination}` : 'Unknown Route'),
            paymentBy: enquiryData.paymentBy || 'Consignor',
            drops: normalizeDrops(enquiryData.drops),
            status: 'Requested',
            created_at: new Date().toISOString(),
            createdAt: enquiryData.createdAt || new Date().toISOString(),
            trackingHistory: [
                { status: 'Enquiry Created', date: new Date().toLocaleString(), completed: true },
            ],
            documents: enquiryData.documents || [],
        };

        const dbEnquiry = mapAppOrderToDb(newEnquiry);

        try {
            const { error } = await supabase.from('orders').insert([dbEnquiry]);
            if (error) {
                console.error('Supabase Insert Error:', error);
                throw new Error('Failed to save enquiry: ' + error.message);
            }
            setEnquiries((prev) => [mapDbOrderToApp(dbEnquiry), ...prev]);
            return newEnquiry;
        } catch (e) {
            console.error('Add Enquiry Error:', e);
            throw e;
        }
    };

    const updateEnquiryStatus = async (id, status, updates = {}) => {
        const current = enquiries.find((e) => e.id === id) || {};
        const merged = {
            ...current,
            ...updates,
            id,
            status,
            drops: normalizeDrops(updates.drops || current.drops),
        };

        // Optimistic UI
        setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, ...merged } : e)));

        try {
            const dbUpdates = stripUndefined({
                status,
                trip_status: updates.tripStatus ?? current.tripStatus,
                client_name: updates.clientName ?? current.clientName,
                client_phone: updates.clientPhone ?? current.clientPhone,
                client_email: updates.clientEmail ?? current.clientEmail,
                origin: updates.origin || updates.pickups?.[0]?.city || current.origin,
                destination: updates.destination || updates.drops?.[0]?.city || current.destination,
                order_id: updates.enquiryNumber || current.enquiryNumber || current.orderId,
                order_date: updates.pickupDate || current.pickupDate || current.orderDate,
                pay_type: updates.paymentBy || current.paymentBy || current.payType,
                vehicle_type: updates.vehicleType || updates.loadType || current.vehicleType || current.loadType,
                pickups: updates.pickups || current.pickups,
                drops: normalizeDrops(updates.drops || current.drops),
                materials: updates.materials || current.materials,
                documents: withEnquiryMetaDoc(current.documents || updates.documents || [], {
                    enquiryNumber: updates.enquiryNumber || current.enquiryNumber,
                    pickupDate: updates.pickupDate || current.pickupDate,
                    expiresAt: updates.expiresAt || current.expiresAt,
                    loadType: updates.loadType || current.loadType,
                    requestedTrucks: updates.requestedTrucks || current.requestedTrucks,
                    paymentBy: updates.paymentBy || current.paymentBy,
                    route:
                        updates.route ||
                        current.route ||
                        `${updates.origin || current.origin || ''} -> ${updates.destination || current.destination || ''}`,
                    createdAt: current.createdAt || current.created_at,
                    origin: updates.origin || updates.pickups?.[0]?.city || current.origin,
                    destination: updates.destination || updates.drops?.[0]?.city || current.destination,
                }),
                tracking_history: updates.trackingHistory || current.trackingHistory,
            });

            const { error } = await supabase.from('orders').update(dbUpdates).eq('id', id);
            if (error) throw error;
        } catch (e) {
            console.error('Update Status Error:', e);
            throw e;
        }
    };

    const addDocument = async (enquiryId, doc) => {
        const order = enquiries.find((o) => o.id === enquiryId);
        if (!order) throw new Error('Trip/enquiry not found');

        const newDocs = [
            ...(order.documents || []).filter((d) => d?.type !== ENQUIRY_META_TYPE),
            ...((order.documents || []).filter((d) => d?.type === ENQUIRY_META_TYPE)),
            {
                ...doc,
                date:
                    doc.date ||
                    new Date()
                        .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
                        .replace(/ /g, '-')
                        .toUpperCase(),
            },
        ];

        setEnquiries((prev) => prev.map((o) => (o.id === enquiryId ? { ...o, documents: newDocs } : o)));

        try {
            const { error } = await supabase.from('orders').update({ documents: newDocs }).eq('id', enquiryId);
            if (error) throw error;
        } catch (e) {
            console.error('Add Document Error:', e);
            throw e;
        }
    };

    return (
        <AppContext.Provider
            value={{
                enquiries,
                loading,
                addEnquiry,
                updateEnquiryStatus,
                chats,
                setChats,
                addDocument,
                refreshEnquiries,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
