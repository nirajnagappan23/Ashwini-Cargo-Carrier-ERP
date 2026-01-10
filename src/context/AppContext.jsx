import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chats, setChats] = useState([]);

    // ---- MAPPERS ----

    const mapDbOrderToApp = (dbOrder) => ({
        ...dbOrder,
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
        truckPaymentHistory: dbOrder.truck_payment_history || [], // Less likely needed for client but good to have
        truckExpenses: dbOrder.truck_expenses || [],
        documents: dbOrder.documents || [],
        chats: dbOrder.chats || [],
        // Preserve JSONB
        pickups: dbOrder.pickups || [],
        drops: dbOrder.drops || [],
        materials: dbOrder.materials || [],
        consignments: dbOrder.consignments || []
    });

    const mapAppOrderToDb = (appOrder) => ({
        id: appOrder.id,
        order_id: appOrder.orderId,
        order_date: appOrder.orderDate,
        client_ref: appOrder.clientRef,
        client_name: appOrder.clientName,
        client_phone: appOrder.clientPhone,
        client_email: appOrder.clientEmail,
        origin: appOrder.origin,
        destination: appOrder.destination,
        trip_status: appOrder.tripStatus,
        status: appOrder.status,
        vehicle_type: appOrder.vehicleType,
        total_freight: appOrder.totalFreight,
        quote_amount: appOrder.quoteAmount,
        client_price: appOrder.clientPrice,
        pay_type: appOrder.payType,
        payment_mode: appOrder.paymentMode,
        tracking_history: appOrder.trackingHistory,
        documents: appOrder.documents,
        chats: appOrder.chats,
        pickups: appOrder.pickups,
        drops: appOrder.drops,
        materials: appOrder.materials,
        consignments: appOrder.consignments,
        created_at: appOrder.created_at || new Date().toISOString()
    });

    // Initial Data Fetch
    useEffect(() => {
        const fetchClientData = async () => {
            try {
                const { data, error } = await supabase.from('orders').select('*');
                if (!error && data) {
                    setEnquiries(data.map(mapDbOrderToApp));
                }
            } catch (e) {
                console.error("Client Data Fetch Error:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchClientData();
    }, []);

    const addEnquiry = async (enquiryData) => {
        // Prepare new order object
        const newEnquiry = {
            id: `ENQ-${Date.now()}`,
            ...enquiryData,
            status: 'Requested',
            created_at: new Date().toISOString(),
            trackingHistory: [{ status: 'Enquiry Created', date: new Date().toLocaleString(), completed: true }]
        };

        setEnquiries([newEnquiry, ...enquiries]);

        // Map to DB format
        const dbEnquiry = mapAppOrderToDb(newEnquiry);

        // Remove undefined keys to let DB defaults handling them or avoid errors
        Object.keys(dbEnquiry).forEach(key => dbEnquiry[key] === undefined && delete dbEnquiry[key]);

        try {
            await supabase.from('orders').insert([dbEnquiry]);
        } catch (e) {
            console.error("Add Enquiry Error:", e);
        }
    };

    const updateEnquiryStatus = async (id, status, updates = {}) => {
        setEnquiries(enquiries.map(e => {
            if (e.id === id) {
                return { ...e, status, ...updates };
            }
            return e;
        }));

        try {
            // Map common updates
            const dbUpdates = { status };
            if (updates.tripStatus) dbUpdates.trip_status = updates.tripStatus;

            await supabase.from('orders').update(dbUpdates).eq('id', id);
        } catch (e) {
            console.error("Update Status Error:", e);
        }
    };

    const addDocument = async (enquiryId, doc) => {
        const order = enquiries.find(o => o.id === enquiryId);
        if (!order) return;

        const newDocs = [...(order.documents || []), {
            ...doc,
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).replace(/ /g, '-').toUpperCase()
        }];

        setEnquiries(enquiries.map(o => o.id === enquiryId ? { ...o, documents: newDocs } : o));

        try {
            await supabase.from('orders').update({ documents: newDocs }).eq('id', enquiryId);
        } catch (e) {
            console.error("Add Document Error:", e);
        }
    };

    return (
        <AppContext.Provider value={{ enquiries, addEnquiry, updateEnquiryStatus, chats, setChats, addDocument }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
