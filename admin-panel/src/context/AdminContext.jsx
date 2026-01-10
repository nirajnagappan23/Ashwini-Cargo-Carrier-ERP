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
    const [orders, setOrders] = useState([]);
    const [clients, setClients] = useState([]);
    const [brokers, setBrokers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false); // Default false to ensure render

    // Mock Data for Safety
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

    useEffect(() => {
        const initializeData = async () => {
            try {
                // Safeguard Supabase Calls
                const { data: userData } = await supabase.from('users').select('*');
                if (userData) setUsers(userData.length > 0 ? userData : mockUsers);
                else setUsers(mockUsers);

                const { data: orderData } = await supabase.from('orders').select('*');
                if (orderData) {
                    // Simple Mapping
                    const mappedOrders = orderData.map(dbOrder => ({
                        ...dbOrder,
                        orderId: dbOrder.order_id,
                        orderDate: dbOrder.order_date,
                        clientName: dbOrder.client_name,
                        tripStatus: dbOrder.trip_status,
                        totalFreight: dbOrder.total_freight,
                        balance: dbOrder.balance,
                        vehicleNo: dbOrder.vehicle_no,
                        driverName: dbOrder.driver_name,
                        driverPhone: dbOrder.driver_phone,
                        trackingHistory: dbOrder.tracking_history || [],
                        documents: dbOrder.documents || [],
                        pickups: dbOrder.pickups || [],
                        drops: dbOrder.drops || [],
                        consignments: dbOrder.consignments || []
                    }));
                    setOrders(mappedOrders);
                }

                const { data: clientData } = await supabase.from('clients').select('*');
                if (clientData) {
                    const mappedClients = clientData.map(c => ({
                        ...c,
                        totalOrders: c.total_orders,
                        pendingPayment: c.pending_payment
                    }));
                    setClients(mappedClients);
                }

            } catch (error) {
                console.error("AdminContext Init Error:", error);
                setUsers(mockUsers);
            }
        };

        initializeData();
    }, []);

    // Placeholder Actions (to prevent crashes if called)
    const addOrder = async (data) => console.log("Add Order", data);
    const updateOrderStatus = async (id, status) => console.log("Status", status);
    const updateOrderDetails = async (id, updates) => console.log("Updates", updates);
    const mapDbOrderToApp = (d) => d;

    // Auth
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
        window.location.href = '/login';
    };
    const getCurrentUser = () => JSON.parse(localStorage.getItem('adminUser'));
    const addTrackingUpdate = () => { };
    const addDocument = () => { };
    const deleteDocument = () => { };
    const recordPayment = () => { };
    const recordTruckPayment = () => { };
    const recordExpense = () => { };
    const updateTruckPayment = () => { };
    const addClient = () => { };
    const updateClient = () => { };
    const addUser = () => { };
    const updateUser = () => { };
    const deleteUser = () => { };


    const value = {
        orders, clients, setClients, users, brokers, setBrokers,
        login, logout, getCurrentUser,
        addOrder, updateOrderStatus, updateOrderDetails,
        addTrackingUpdate, addDocument, deleteDocument,
        recordPayment, recordTruckPayment, recordExpense,
        updateTruckPayment, addClient, updateClient,
        addUser, updateUser, deleteUser
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};
