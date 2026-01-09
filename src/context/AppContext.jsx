import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Data Fetch (Syncs with Admin Panel's Supabase Data)
    useEffect(() => {
        const fetchClientData = async () => {
            // For Demo: We will fetch ALL orders for now to simulate the client view
            // In real app: We would filter by client_id = logged_in_user_id
            try {
                const { data, error } = await supabase.from('orders').select('*');
                if (!error && data) {
                    setEnquiries(data);
                } else {
                    // Fallback to empty or specific demo mocked data if DB is empty
                    // For now, let's just keep it empty if DB is empty to encourage adding data from Admin
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
        // ... (Existing logic to add enquiry - we need to make this write to DB too)
        // Since the user is 'locking in', we will implement the proper DB write.

        // 1. Prepare new order object compatible with DB schema
        const newEnquiry = {
            id: `ENQ-${Date.now()}`, // Temporary ID
            ...enquiryData,
            status: 'Requested',
            created_at: new Date().toISOString(),
            // Default fields for new enquiry
            tracking_history: [{ status: 'Enquiry Created', date: new Date().toLocaleString(), completed: true }]
        };

        setEnquiries([newEnquiry, ...enquiries]);

        try {
            await supabase.from('orders').insert([newEnquiry]);
        } catch (e) {
            console.error("Add Enquiry Error:", e);
        }
    };

    // ... (Other helper functions)


    const [chats, setChats] = useState([]);

    const updateEnquiryStatus = async (id, status, updates = {}) => {
        // Optimistic UI Update
        setEnquiries(enquiries.map(e => {
            if (e.id === id) {
                // If confirming, you might want to generate Order ID logic here or let Admin do it.
                // For simplicity, we just update status.
                return { ...e, status, ...updates };
            }
            return e;
        }));

        try {
            await supabase.from('orders').update({ status, ...updates }).eq('id', id);
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

        // Optimistic
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
