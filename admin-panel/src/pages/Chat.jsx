import React, { useState, useRef, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Search, Send, User, MessageSquare, Paperclip, X, Image as ImageIcon, FileText } from 'lucide-react';

const Chat = () => {
    const { clients } = useAdmin();
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [inputMessage, setInputMessage] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [clientChats, setClientChats] = useState({});
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Initialize with mock data
    useEffect(() => {
        const initialChats = {};
        clients.forEach(client => {
            initialChats[client.id] = [
                {
                    id: 1,
                    sender: 'admin',
                    text: `Hello ${client.name}! How can we help you today?`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    date: new Date().toLocaleDateString()
                }
            ];
        });
        setClientChats(initialChats);
    }, [clients]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedClient, clientChats]);

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const newAttachments = files.map(file => ({
            id: Date.now() + Math.random(),
            file,
            name: file.name,
            type: file.type,
            size: file.size,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        }));
        setAttachments([...attachments, ...newAttachments]);
    };

    const removeAttachment = (id) => {
        setAttachments(attachments.filter(a => a.id !== id));
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim() && attachments.length === 0) return;
        if (!selectedClient) return;

        const newMessage = {
            id: Date.now(),
            sender: 'admin',
            text: inputMessage,
            attachments: attachments.map(a => ({ name: a.name, type: a.type, size: a.size })),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString()
        };

        setClientChats({
            ...clientChats,
            [selectedClient.id]: [...(clientChats[selectedClient.id] || []), newMessage]
        });
        setInputMessage('');
        setAttachments([]);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getLastMessage = (clientId) => {
        const messages = clientChats[clientId] || [];
        return messages.length > 0 ? messages[messages.length - 1] : null;
    };

    return (
        <div>
            <div className="admin-header" style={{ marginBottom: '1.5rem' }}>
                <h1>Client Chat</h1>
                <p>Communicate with your clients in real-time</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 200px)' }}>
                {/* Clients List */}
                <div className="admin-card" style={{ width: '320px', padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--admin-border)' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>Clients</h3>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-light)' }} />
                            <input
                                type="text"
                                placeholder="Search clients..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.5rem', border: '1px solid var(--admin-border)', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                            />
                        </div>
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {filteredClients.map((client) => {
                            const lastMsg = getLastMessage(client.id);
                            return (
                                <div
                                    key={client.id}
                                    onClick={() => setSelectedClient(client)}
                                    style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid var(--admin-border)',
                                        cursor: 'pointer',
                                        background: selectedClient?.id === client.id ? '#f8fafc' : 'transparent',
                                        borderLeft: selectedClient?.id === client.id ? '4px solid var(--admin-primary)' : '4px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedClient?.id !== client.id) e.currentTarget.style.background = '#fafbfc';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedClient?.id !== client.id) e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <User size={20} />
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {lastMsg ? lastMsg.text : 'No messages yet'}
                                            </div>
                                        </div>
                                        {lastMsg && (
                                            <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', flexShrink: 0 }}>
                                                {lastMsg.time}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="admin-card" style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {selectedClient ? (
                        <>
                            {/* Header */}
                            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: '600', fontSize: '1rem' }}>{selectedClient.name}</h3>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>
                                            {selectedClient.email} • {selectedClient.phone}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
                                {(!clientChats[selectedClient.id] || clientChats[selectedClient.id].length === 0) && (
                                    <div style={{ textAlign: 'center', marginTop: '20%', color: '#94a3b8' }}>
                                        <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                        <p>Start the conversation with {selectedClient.name}</p>
                                    </div>
                                )}
                                {clientChats[selectedClient.id]?.map((msg, index) => {
                                    const showDate = index === 0 || clientChats[selectedClient.id][index - 1].date !== msg.date;
                                    return (
                                        <React.Fragment key={msg.id}>
                                            {showDate && (
                                                <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                                                    <span style={{
                                                        background: '#e2e8f0',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '9999px',
                                                        fontSize: '0.75rem',
                                                        color: '#64748b'
                                                    }}>
                                                        {msg.date}
                                                    </span>
                                                </div>
                                            )}
                                            <div style={{
                                                alignSelf: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                                                maxWidth: '70%'
                                            }}>
                                                <div style={{
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '0.75rem',
                                                    background: msg.sender === 'admin' ? 'var(--admin-primary)' : 'white',
                                                    color: msg.sender === 'admin' ? 'white' : '#1e293b',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                    borderBottomRightRadius: msg.sender === 'admin' ? '0.25rem' : '0.75rem',
                                                    borderBottomLeftRadius: msg.sender === 'admin' ? '0.75rem' : '0.25rem'
                                                }}>
                                                    {msg.text && <p style={{ fontSize: '0.875rem', marginBottom: msg.attachments?.length > 0 ? '0.5rem' : 0 }}>{msg.text}</p>}
                                                    {msg.attachments?.map((att, i) => (
                                                        <div key={i} style={{
                                                            marginTop: '0.5rem',
                                                            padding: '0.5rem',
                                                            background: msg.sender === 'admin' ? 'rgba(255,255,255,0.1)' : '#f8fafc',
                                                            borderRadius: '0.375rem',
                                                            fontSize: '0.75rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem'
                                                        }}>
                                                            {att.type.startsWith('image/') ? <ImageIcon size={14} /> : <FileText size={14} />}
                                                            <span>{att.name}</span>
                                                        </div>
                                                    ))}
                                                    <div style={{
                                                        fontSize: '0.7rem',
                                                        marginTop: '0.25rem',
                                                        opacity: 0.7,
                                                        textAlign: 'right'
                                                    }}>
                                                        {msg.time}
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Attachments Preview */}
                            {attachments.length > 0 && (
                                <div style={{
                                    padding: '0.75rem 1.5rem',
                                    borderTop: '1px solid var(--admin-border)',
                                    background: '#f8fafc',
                                    display: 'flex',
                                    gap: '0.5rem',
                                    flexWrap: 'wrap'
                                }}>
                                    {attachments.map(att => (
                                        <div key={att.id} style={{
                                            position: 'relative',
                                            padding: '0.5rem 0.75rem',
                                            background: '#ffffff',
                                            border: '1px solid var(--admin-border)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            {att.preview ? (
                                                <img src={att.preview} alt={att.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '0.25rem' }} />
                                            ) : (
                                                <FileText size={16} style={{ color: '#64748b' }} />
                                            )}
                                            <div>
                                                <div style={{ fontWeight: '500' }}>{att.name}</div>
                                                <div style={{ color: '#94a3b8' }}>{formatFileSize(att.size)}</div>
                                            </div>
                                            <button
                                                onClick={() => removeAttachment(att.id)}
                                                style={{
                                                    marginLeft: '0.5rem',
                                                    padding: '0.25rem',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#ef4444'
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Input */}
                            <form onSubmit={handleSendMessage} style={{ padding: '1rem 1.5rem', background: 'white', borderTop: '1px solid var(--admin-border)' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        multiple
                                        style={{ display: 'none' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="admin-btn admin-btn-outline"
                                        style={{ padding: '0.625rem' }}
                                    >
                                        <Paperclip size={18} />
                                    </button>
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={e => setInputMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        style={{ flex: 1, padding: '0.625rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--admin-border)', fontSize: '0.875rem' }}
                                    />
                                    <button
                                        type="submit"
                                        className="admin-btn admin-btn-primary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem' }}
                                    >
                                        <Send size={16} /> Send
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-light)' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                <MessageSquare size={32} />
                            </div>
                            <h3>Select a client to start chatting</h3>
                            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Choose a client from the list to view and send messages</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
