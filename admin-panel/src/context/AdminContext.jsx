import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AdminContext = createContext();

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within AdminProvider');
    }
    return context;
};

export const AdminProvider = ({ children }) => {
    // ---- STATE ----
    const [orders, setOrders] = useState([]);
    const [clients, setClients] = useState([]);
    const [brokers, setBrokers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock Data (Fallback)
    const mockUsers = [
        {
            id: 'USR-001',
            name: 'Niraj',
            email: 'nirajnagappan@gmail.com',
            phone: '9944673442',
            role: 'Master Admin',
            status: 'Active',
            lastLogin: '2026-01-08 10:00 AM',
            password: 'Niraj!!123'
        }
    ];

    // ---- HELPERS: SAFETY CHECKS ----
    const safeArray = (arr) => Array.isArray(arr) ? arr : [];

    // ---- MAPPER: DB (Snake) -> APP (Camel) ----
    const mapDbOrderToApp = (dbOrder) => {
        if (!dbOrder) return null;
        return {
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
            freightRate: dbOrder.freight_rate,
            freightUnit: dbOrder.freight_unit,
            payType: dbOrder.pay_type,
            paymentMode: dbOrder.payment_mode,
            truckHire: dbOrder.truck_hire,
            truckAdvancePaid: dbOrder.truck_advance_paid,
            truckTotalExpenses: dbOrder.truck_total_expenses,
            truckTotalPaid: dbOrder.truck_total_paid,
            truckBalance: dbOrder.truck_balance,
            vehicleNo: dbOrder.vehicle_no,
            driverName: dbOrder.driver_name,
            driverPhone: dbOrder.driver_phone,
            trackingHistory: safeArray(dbOrder.tracking_history),
            paymentHistory: safeArray(dbOrder.payment_history),
            truckPaymentHistory: safeArray(dbOrder.truck_payment_history),
            truckExpenses: safeArray(dbOrder.truck_expenses),
            documents: safeArray(dbOrder.documents),
            chats: safeArray(dbOrder.chats),
            driverPhotos: safeArray(dbOrder.driver_photos),
            loadingPhotos: safeArray(dbOrder.loading_photos),
            unloadingPhotos: safeArray(dbOrder.unloading_photos),
            pickups: safeArray(dbOrder.pickups),
            drops: safeArray(dbOrder.drops),
            materials: safeArray(dbOrder.materials),
            consignments: safeArray(dbOrder.consignments)
        };
    };

    const mapDbClientToApp = (dbClient) => {
        if (!dbClient) return null;
        return {
            ...dbClient,
            totalOrders: dbClient.total_orders,
            pendingPayment: dbClient.pending_payment
        };
    };

    // ---- INITIALIZATION ----
    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Users
                const { data: userData } = await supabase.from('users').select('*');
                setUsers(userData && userData.length > 0 ? userData : mockUsers);

                // 2. Fetch Orders
                const { data: orderData } = await supabase.from('orders').select('*');
                if (orderData) {
                    setOrders(orderData.map(mapDbOrderToApp).filter(Boolean));
                }

                // 3. Fetch Clients
                const { data: clientData } = await supabase.from('clients').select('*');
                if (clientData) {
                    setClients(clientData.map(mapDbClientToApp).filter(Boolean));
                }

            } catch (error) {
                console.error("Error fetching data from Supabase:", error);
                setUsers(mockUsers);
            } finally {
                setLoading(false);
            }
        };

        initializeData();
    }, []);

    // ---- ACTIONS with Supabase Sync ----

    const addUser = async (userData) => {
        const newUser = {
            id: `USR-${String(users.length + 1).padStart(3, '0')}`,
            status: 'Active',
            lastLogin: '-',
            ...userData
        };
        setUsers([...users, newUser]);
        try { await supabase.from('users').insert([newUser]); } catch (e) { console.error(e); }
    };

    const updateUser = async (userId, updates) => {
        setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
        try { await supabase.from('users').update(updates).eq('id', userId); } catch (e) { console.error(e); }
    };

    const deleteUser = async (userId) => {
        setUsers(users.filter(u => u.id !== userId));
        try { await supabase.from('users').delete().eq('id', userId); } catch (e) { console.error(e); }
    };

    const login = (email, password) => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            localStorage.setItem('adminAuth', 'true');
            localStorage.setItem('adminUser', JSON.stringify(user));
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
    };

    // --- Order Logic ---

    const generateOrderId = () => {
        const date = new Date();
        const dd = String(date.getDate()).padStart(2, '0');
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const mmm = months[date.getMonth()];
        const yy = String(date.getFullYear()).slice(-2);
        const dateString = `${dd}-${mmm}-${yy}`;
        const currentMonthOrders = orders.filter(o => o.orderId && o.orderId.includes(`-${mmm}-`));
        const sequence = String(currentMonthOrders.length + 1).padStart(3, '0');
        return { id: `ORD${sequence}/${dateString}`, date: dateString };
    };

    const addOrder = async (orderData) => {
        const newId = `ENQ-${String(orders.length + 1001).padStart(4, '0')}`;
        const clientRef = `REF-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const { id: orderId, date: orderDate } = generateOrderId();

        // App Object
        const newOrderApp = {
            id: newId,
            clientRef,
            orderId,
            orderDate,
            ...orderData, // Contains camelCase and logic needed for UI
            consignments: [],
            trackingHistory: [{ status: 'Order Confirmed', location: '-', date: new Date().toLocaleString('en-GB'), completed: true }]
        };

        // DB Object (Map to Snake Case)
        // Ensure values are not undefined
        const newOrderDB = {
            id: newId,
            client_ref: clientRef,
            order_id: orderId,
            order_date: orderDate,
            client_name: orderData.clientName,
            client_phone: orderData.clientPhone,
            client_email: orderData.clientEmail,
            origin: orderData.origin,
            destination: orderData.destination,
            trip_status: orderData.tripStatus,
            status: orderData.status,
            vehicle_type: orderData.vehicleType,
            total_freight: orderData.totalFreight,
            advance: orderData.advance,
            balance: orderData.balance,
            quote_amount: orderData.quoteAmount,
            client_price: orderData.clientPrice,
            freight_rate: orderData.freightRate,
            freight_unit: orderData.freightUnit,
            pay_type: orderData.payType,
            payment_mode: orderData.paymentMode,
            truck_hire: 0,
            truck_advance_paid: 0,
            truck_total_expenses: 0,
            truck_total_paid: 0,
            truck_balance: 0,
            vehicle_no: orderData.vehicleNo,
            driver_name: orderData.driverName,
            driver_phone: orderData.driverPhone,
            pickups: orderData.pickups || [],
            drops: orderData.drops || [],
            materials: orderData.materials || [],
            consignments: [],
            tracking_history: [{ status: 'Order Confirmed', location: '-', date: new Date().toLocaleString('en-GB'), completed: true }],
            documents: [],
            chats: [],
            created_at: new Date().toISOString()
        };

        // Remove keys with undefined values to avoid DB issues
        Object.keys(newOrderDB).forEach(key => newOrderDB[key] === undefined && delete newOrderDB[key]);

        setOrders([...orders, newOrderApp]);
        try { await supabase.from('orders').insert([newOrderDB]); } catch (e) { console.error("addOrder Error:", e); }
    };

    const updateOrderStatus = async (orderId, status) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, tripStatus: status } : o));
        try { await supabase.from('orders').update({ trip_status: status }).eq('id', orderId); } catch (e) { console.error(e); }
    };

    const updateOrderDetails = async (orderId, updates) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, ...updates } : o));

        // Map updates to DB keys
        const dbUpdates = {};
        if (updates.vehicleNo !== undefined) dbUpdates.vehicle_no = updates.vehicleNo;
        if (updates.driverName !== undefined) dbUpdates.driver_name = updates.driverName;
        if (updates.driverPhone !== undefined) dbUpdates.driver_phone = updates.driverPhone;
        if (updates.tripStatus !== undefined) dbUpdates.trip_status = updates.tripStatus;
        if (updates.totalFreight !== undefined) dbUpdates.total_freight = updates.totalFreight;
        if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
        if (updates.paymentMode !== undefined) dbUpdates.payment_mode = updates.paymentMode;
        if (updates.documents !== undefined) dbUpdates.documents = updates.documents;
        if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName;
        // For photos
        if (updates.driverPhotos !== undefined) dbUpdates.driver_photos = updates.driverPhotos;
        if (updates.loadingPhotos !== undefined) dbUpdates.loading_photos = updates.loadingPhotos;
        if (updates.unloadingPhotos !== undefined) dbUpdates.unloading_photos = updates.unloadingPhotos;


        if (Object.keys(dbUpdates).length > 0) {
            try { await supabase.from('orders').update(dbUpdates).eq('id', orderId); } catch (e) { console.error(e); }
        }
    };

    const addTrackingUpdate = async (orderId, trackingData) => {
        const order = orders.find(o => o.id === orderId);
        const newHistory = [...(order.trackingHistory || []), trackingData];

        setOrders(orders.map(o => o.id === orderId ? { ...o, trackingHistory: newHistory } : o));

        try { await supabase.from('orders').update({ tracking_history: newHistory }).eq('id', orderId); } catch (e) { console.error(e); }
    };

    const confirmOrder = async (enquiryId, finalPrice) => {
        const { id: orderId, date: orderDate } = generateOrderId();
        const trackingData = { status: 'Order Confirmed', location: '-', date: new Date().toLocaleString('en-GB'), completed: true };

        const updatesApp = {
            orderId,
            orderDate,
            status: 'Confirmed',
            quoteAmount: finalPrice,
            totalFreight: finalPrice,
            tripStatus: 'Loading',
            trackingHistory: [trackingData]
        };

        const updatesDB = {
            order_id: orderId,
            order_date: orderDate,
            status: 'Confirmed',
            quote_amount: finalPrice,
            total_freight: finalPrice,
            trip_status: 'Loading',
            tracking_history: [trackingData]
        };

        setOrders(orders.map(o => o.id === enquiryId ? { ...o, ...updatesApp } : o));
        try { await supabase.from('orders').update(updatesDB).eq('id', enquiryId); } catch (e) { console.error(e); }
    };

    const addDocument = async (orderId, docData) => {
        const order = orders.find(o => o.id === orderId);
        const newDocs = [...(order.documents || []), { ...docData, date: new Date().toISOString().split('T')[0] }];

        setOrders(orders.map(o => o.id === orderId ? { ...o, documents: newDocs } : o));
        try { await supabase.from('orders').update({ documents: newDocs }).eq('id', orderId); } catch (e) { console.error(e); }
    };

    const deleteDocument = async (orderId, docIndex) => {
        const order = orders.find(o => o.id === orderId);
        const newDocs = [...(order.documents || [])];
        newDocs.splice(docIndex, 1);
        setOrders(orders.map(o => o.id === orderId ? { ...o, documents: newDocs } : o));
        try { await supabase.from('orders').update({ documents: newDocs }).eq('id', orderId); } catch (e) { console.error(e); }
    };

    const recordPayment = async (orderId, paymentData) => {
        const order = orders.find(o => o.id === orderId);
        const newHistory = [...(order.paymentHistory || []), { id: `PAY-${Date.now()}`, ...paymentData, recordedAt: new Date().toISOString() }];
        const newTotalPaid = (order.advance || 0) + (parseFloat(paymentData.amount) || 0);
        const newBalance = (order.totalFreight || 0) - newTotalPaid;

        const updatesApp = { paymentHistory: newHistory, advance: newTotalPaid, balance: newBalance };
        const updatesDB = { payment_history: newHistory, advance: newTotalPaid, balance: newBalance };

        setOrders(orders.map(o => o.id === orderId ? { ...o, ...updatesApp } : o));
        try { await supabase.from('orders').update(updatesDB).eq('id', orderId); } catch (e) { console.error(e); }
    };

    // Client Logic (Persisted Correctly)
    const addClient = async (clientData) => {
        const id = `CLT-${String(clients.length + 1).padStart(3, '0')}`;

        const newClientDB = {
            id: id,
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone,
            gst: clientData.gst,
            address: clientData.address,
            total_orders: 0,
            pending_payment: 0
        };

        const newUserDB = {
            id: `USR-${Date.now()}`,
            email: clientData.username || clientData.email,
            password: clientData.password || 'welcome123',
            name: clientData.displayName || clientData.name,
            role: 'client',
            phone: clientData.phone,
            status: 'Active',
            last_login: '-'
        };

        const newClientUI = {
            id: id,
            totalOrders: 0,
            pendingPayment: 0,
            ...clientData
        };

        setClients([...clients, newClientUI]);

        try {
            const { error: clientError } = await supabase.from('clients').insert([newClientDB]);
            if (clientError) console.error("Error inserting client:", clientError);

            const { error: userError } = await supabase.from('users').insert([newUserDB]);
            if (userError) console.error("Error creating client user:", userError);
        } catch (e) {
            console.error("Exception in addClient:", e);
        }
    };

    const updateClient = async (clientId, updates) => {
        setClients(clients.map(c => c.id === clientId ? { ...c, ...updates } : c));

        try {
            const { username, password, displayName, ...clientProfileUpdates } = updates;
            if (Object.keys(clientProfileUpdates).length > 0) {
                await supabase.from('clients').update(clientProfileUpdates).eq('id', clientId);
            }
            if (username || password || displayName) {
                console.warn("Credential updates for Clients require manual DB sync currently.");
            }
        } catch (e) {
            console.error("Error updating client:", e);
        }
    };

    // Truck Payment Logic
    const recordTruckPayment = async (orderId, paymentData) => {
        const order = orders.find(o => o.id === orderId);

        const newHistory = [...(order.truckPaymentHistory || []), {
            id: `TPAY-${Date.now()}`,
            ...paymentData,
            recordedAt: new Date().toISOString()
        }];

        const updatedTruckHire = paymentData.truckHire ? parseFloat(paymentData.truckHire) : (order.truckHire || 0);

        const totalAdvances = newHistory
            .filter(p => p.type === 'Advance')
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

        const totalExpenses = (order.truckExpenses || [])
            .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

        const totalPaid = totalAdvances + totalExpenses;
        const truckBalance = updatedTruckHire - totalPaid;

        const updatesApp = {
            truckHire: updatedTruckHire,
            truckPaymentHistory: newHistory,
            truckAdvancePaid: totalAdvances,
            truckTotalExpenses: totalExpenses,
            truckTotalPaid: totalPaid,
            truckBalance: truckBalance
        };

        const updatesDB = {
            truck_hire: updatedTruckHire,
            truck_payment_history: newHistory,
            truck_advance_paid: totalAdvances,
            truck_total_expenses: totalExpenses,
            truck_total_paid: totalPaid,
            truck_balance: truckBalance
        };

        setOrders(orders.map(o => o.id === orderId ? { ...o, ...updatesApp } : o));
        try { await supabase.from('orders').update(updatesDB).eq('id', orderId); } catch (e) { console.error("Supabase Sync Error (Truck Payment):", e); }
    };

    const recordExpense = async (orderId, expenseData) => {
        const order = orders.find(o => o.id === orderId);
        const newExpense = {
            id: `EXP-${Date.now()}`,
            ...expenseData,
            recordedAt: new Date().toISOString()
        };

        const updatedExpenses = [...(order.truckExpenses || []), newExpense];
        const totalExpenses = updatedExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
        const totalAdvances = (order.truckPaymentHistory || [])
            .filter(p => p.type === 'Advance')
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

        const totalPaid = totalAdvances + totalExpenses;
        const truckBalance = (order.truckHire || 0) - totalPaid;

        const updatesApp = {
            truckExpenses: updatedExpenses,
            truckTotalExpenses: totalExpenses,
            truckTotalPaid: totalPaid,
            truckBalance: truckBalance
        };

        const updatesDB = {
            truck_expenses: updatedExpenses,
            truck_total_expenses: totalExpenses,
            truck_total_paid: totalPaid,
            truck_balance: truckBalance
        };

        setOrders(orders.map(o => o.id === orderId ? { ...o, ...updatesApp } : o));
        try { await supabase.from('orders').update(updatesDB).eq('id', orderId); } catch (e) { console.error(e); }
    };

    const updateTruckPayment = async (orderId, paymentId, updatedPaymentData) => {
        const order = orders.find(o => o.id === orderId);
        const updatedHistory = (order.truckPaymentHistory || []).map(p =>
            p.id === paymentId ? { ...p, ...updatedPaymentData } : p
        );

        const totalAdvances = updatedHistory
            .filter(p => p.type === 'Advance')
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

        const totalExpenses = (order.truckExpenses || [])
            .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

        const totalPaid = totalAdvances + totalExpenses;
        const truckBalance = (order.truckHire || 0) - totalPaid;

        const updatesApp = {
            truckPaymentHistory: updatedHistory,
            truckAdvancePaid: totalAdvances,
            truckTotalExpenses: totalExpenses,
            truckTotalPaid: totalPaid,
            truckBalance: truckBalance
        };

        const updatesDB = {
            truck_payment_history: updatedHistory,
            truck_advance_paid: totalAdvances,
            truck_total_expenses: totalExpenses,
            truck_total_paid: totalPaid,
            truck_balance: truckBalance
        };

        setOrders(orders.map(o => o.id === orderId ? { ...o, ...updatesApp } : o));
        try { await supabase.from('orders').update(updatesDB).eq('id', orderId); } catch (e) { console.error(e); }
    };

    const value = {
        orders, clients, setClients, addClient, updateClient,
        brokers, setBrokers, addBroker: (b) => setBrokers([...brokers, b]), // Placeholder
        updateOrderStatus, updateOrderDetails, addTrackingUpdate, addOrder, confirmOrder,
        sendAdminMessage: (id, txt) => { }, // Placeholder
        addDocument, deleteDocument, recordPayment,
        recordTruckPayment, updateTruckPayment, recordExpense,
        users, addUser, updateUser, deleteUser, login, logout,
        getCurrentUser: () => JSON.parse(localStorage.getItem('adminUser'))
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};
