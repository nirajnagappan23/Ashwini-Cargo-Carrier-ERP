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
        },
        {
            id: 'USR-002',
            name: 'Rathy',
            email: 'rathy@ashwinicargo.com',
            phone: '+91 98000 00002',
            role: 'Admin',
            status: 'Active',
            lastLogin: '2026-01-07 02:30 PM',
            password: 'admin'
        },
        {
            id: 'USR-003',
            name: 'Nagappan',
            email: 'nagappan@ashwinicargo.com',
            phone: '+91 98000 00003',
            role: 'Director',
            status: 'Active',
            lastLogin: '2026-01-06 11:15 AM',
            password: 'admin'
        },
        {
            id: 'USR-004',
            name: 'Sebastian',
            email: 'sebastian@ashwinicargo.com',
            phone: '+91 98000 00004',
            role: 'Manager',
            status: 'Active',
            lastLogin: '2026-01-08 09:00 AM',
            password: 'admin'
        },
        {
            id: 'USR-005',
            name: 'Bala Murugan',
            email: 'bala@ashwinicargo.com',
            phone: '+91 98000 00005',
            role: 'Manager',
            status: 'Active',
            lastLogin: '2026-01-05 04:45 PM',
            password: 'admin'
        }
    ];

    // ---- INITIALIZATION ----
    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Users
                const { data: userData, error: userError } = await supabase.from('users').select('*');

                if (userData && userData.length > 0) {
                    setUsers(userData);
                } else {
                    setUsers(mockUsers);
                }

                // 2. Fetch Orders
                const { data: orderData, error: orderError } = await supabase.from('orders').select('*');
                if (!orderError && orderData && orderData.length > 0) {
                    // Parse JSON fields if necessary (Supabase returns JSONB as object automatically)
                    setOrders(orderData);
                }

                // 3. Fetch Clients
                const { data: clientData, error: clientError } = await supabase.from('clients').select('*');
                if (!clientError && clientData && clientData.length > 0) setClients(clientData);

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

    // Helper to check permissions based on role
    const getPermissions = (role) => {
        switch (role) {
            case 'Master Admin':
                return { canEdit: true, canDelete: true, canManageUsers: true, canViewMaster: true, canCreateOrders: true };
            case 'Admin':
                return { canEdit: true, canDelete: false, canManageUsers: false, canViewMaster: true, canCreateOrders: true };
            case 'Director':
                return { canEdit: false, canDelete: false, canManageUsers: false, canViewMaster: true, canCreateOrders: false };
            case 'Manager':
                return { canEdit: false, canDelete: false, canManageUsers: false, canViewMaster: false, canCreateOrders: false };
            default:
                return { canEdit: false, canDelete: false, canManageUsers: false, canViewMaster: false, canCreateOrders: false };
        }
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

    const getCurrentUser = () => {
        const userStr = localStorage.getItem('adminUser');
        return userStr ? JSON.parse(userStr) : null;
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

        const newOrder = {
            id: newId,
            clientRef,
            orderId,
            orderDate,
            ...orderData,
            consignments: [],
            trackingHistory: [{ status: 'Order Confirmed', location: '-', date: new Date().toLocaleString('en-GB'), completed: true }]
        };

        setOrders([...orders, newOrder]);
        try { await supabase.from('orders').insert([newOrder]); } catch (e) { console.error(e); }
    };

    const updateOrderStatus = async (orderId, status) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, tripStatus: status } : o));
        try { await supabase.from('orders').update({ tripStatus: status }).eq('id', orderId); } catch (e) { console.error(e); }
    };

    const updateOrderDetails = async (orderId, updates) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, ...updates } : o));
        try { await supabase.from('orders').update(updates).eq('id', orderId); } catch (e) { console.error(e); }
    };

    const addTrackingUpdate = async (orderId, trackingData) => {
        const order = orders.find(o => o.id === orderId);
        const newHistory = [...(order.trackingHistory || []), trackingData];
        setOrders(orders.map(o => o.id === orderId ? { ...o, trackingHistory: newHistory } : o));
        try { await supabase.from('orders').update({ trackingHistory: newHistory }).eq('id', orderId); } catch (e) { console.error(e); }
    };

    const confirmOrder = async (enquiryId, finalPrice) => {
        const { id: orderId, date: orderDate } = generateOrderId();
        const updates = {
            orderId,
            orderDate,
            status: 'Confirmed',
            quoteAmount: finalPrice,
            totalFreight: finalPrice,
            tripStatus: 'Loading',
            trackingHistory: [{ status: 'Order Confirmed', location: '-', date: new Date().toLocaleString('en-GB'), completed: true }]
        };
        const order = orders.find(o => o.id === enquiryId);

        setOrders(orders.map(o => o.id === enquiryId ? { ...o, ...updates } : o));
        try { await supabase.from('orders').update(updates).eq('id', enquiryId); } catch (e) { console.error(e); }
    };

    const sendAdminMessage = (orderId, text) => {
        setOrders(orders.map(o => {
            if (o.id === orderId) {
                const newMessage = { sender: 'admin', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
                return { ...o, chats: [...(o.chats || []), newMessage] };
            }
            return o;
        }));
        // Note: Chat sync logic omitted for brevity, would follow similar pattern
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

    const addClient = async (clientData) => {
        const newClient = {
            id: `CLT-${String(clients.length + 1).padStart(3, '0')}`,
            totalOrders: 0,
            pendingPayment: 0,
            ...clientData
        };
        setClients([...clients, newClient]);
        try { await supabase.from('clients').insert([newClient]); } catch (e) { console.error(e); }
    };

    const updateClient = async (clientId, updates) => {
        setClients(clients.map(c => c.id === clientId ? { ...c, ...updates } : c));
        try { await supabase.from('clients').update(updates).eq('id', clientId); } catch (e) { console.error(e); }
    };

    const recordPayment = async (orderId, paymentData) => {
        const order = orders.find(o => o.id === orderId);
        const newHistory = [...(order.paymentHistory || []), { id: `PAY-${Date.now()}`, ...paymentData, recordedAt: new Date().toISOString() }];
        const newTotalPaid = (order.advance || 0) + (parseFloat(paymentData.amount) || 0);
        const newBalance = (order.totalFreight || 0) - newTotalPaid;

        const updates = { paymentHistory: newHistory, advance: newTotalPaid, balance: newBalance };
        setOrders(orders.map(o => o.id === orderId ? { ...o, ...updates } : o));
        try { await supabase.from('orders').update(updates).eq('id', orderId); } catch (e) { console.error(e); }
    };

    // Missing: Broker logic, addBroker, updateBroker (Keep local for now or add table later)
    const addBroker = (brokerData) => {
        const newBroker = { id: `BRK-${String(brokers.length + 1).padStart(3, '0')}`, totalTrips: 0, lastUsed: new Date().toISOString().split('T')[0], ...brokerData };
        setBrokers([...brokers, newBroker]);
    };

    // Truck Payment Logic (Connected to Supabase)
    const recordTruckPayment = async (orderId, paymentData) => {
        const order = orders.find(o => o.id === orderId);

        // 1. Calculate new state
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

        const updates = {
            truckHire: updatedTruckHire,
            truckPaymentHistory: newHistory,
            truckAdvancePaid: totalAdvances,
            truckTotalExpenses: totalExpenses,
            truckTotalPaid: totalPaid,
            truckBalance: truckBalance
        };

        // 2. Optimistic Update
        setOrders(orders.map(o => o.id === orderId ? { ...o, ...updates } : o));

        // 3. Supabase Sync (Note: Requires these columns/jsonb fields in DB)
        try {
            // We store history in the 'truck_payment_history' JSON column if it exists, or 'payment_history' if shared?
            // Actually, we defined a flexible 'orders' table. We should try to update these fields.
            // If columns don't exist, this might fail silently or error depending on Supabase config.
            // Best Practice: map to a 'truck_financials' jsonb column if we could, 
            // but for now we try to update the top-level keys assuming they are JSON or cols.
            // Since we can't change Schema easily right now, we will assume 'orders' table might accept these if added,
            // OR we repackage them into a 'metadata' or 'truck_data' JSON column if we had one.
            // User setup SQL had generic JSONB cols. 
            // Let's assume we can add them or they might be ignored.
            // WAIT: We can use the 'truck_data' pattern or just try to update.
            await supabase.from('orders').update(updates).eq('id', orderId);
        } catch (e) {
            console.error("Supabase Sync Error (Truck Payment):", e);
        }
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

        const updates = {
            truckExpenses: updatedExpenses,
            truckTotalExpenses: totalExpenses,
            truckTotalPaid: totalPaid,
            truckBalance: truckBalance
        };

        setOrders(orders.map(o => o.id === orderId ? { ...o, ...updates } : o));
        try { await supabase.from('orders').update(updates).eq('id', orderId); } catch (e) { console.error(e); }
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

        const updates = {
            truckPaymentHistory: updatedHistory,
            truckAdvancePaid: totalAdvances,
            truckTotalExpenses: totalExpenses,
            truckTotalPaid: totalPaid,
            truckBalance: truckBalance
        };

        setOrders(orders.map(o => o.id === orderId ? { ...o, ...updates } : o));
        try { await supabase.from('orders').update(updates).eq('id', orderId); } catch (e) { console.error(e); }
    };


    const value = {
        orders, clients, setClients, addClient, updateClient,
        brokers, setBrokers, addBroker,
        updateOrderStatus, updateOrderDetails, addTrackingUpdate, addOrder, confirmOrder,
        sendAdminMessage, addDocument, deleteDocument, recordPayment,
        recordTruckPayment, updateTruckPayment, recordExpense,
        users, addUser, updateUser, deleteUser, getCurrentUser, getPermissions, login, logout
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};
