import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Chat = () => {
    const { enquiries } = useApp();
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'admin',
            text: 'Hello! Welcome to Ashwini Cargo Carrier. How can we help you today?',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString()
        }
    ]);
    const [input, setInput] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionType, setSuggestionType] = useState(null); // 'lr' or 'enq'
    const [cursorPosition, setCursorPosition] = useState(0);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Get all LR numbers and Enquiry IDs for suggestions
    const lrNumbers = enquiries
        .filter(e => e.lrNumber)
        .map(e => ({ value: e.lrNumber, label: `LR: ${e.lrNumber}`, id: e.id }));

    const enquiryIds = enquiries
        .map(e => ({ value: e.id, label: `Enquiry: ${e.id}`, id: e.id }));

    // Handle @ mention
    const handleInputChange = (e) => {
        const value = e.target.value;
        const cursorPos = e.target.selectionStart;
        setInput(value);
        setCursorPosition(cursorPos);

        // Check if user typed @
        const lastAtIndex = value.lastIndexOf('@', cursorPos - 1);
        if (lastAtIndex !== -1 && cursorPos - lastAtIndex <= 20) {
            const searchTerm = value.substring(lastAtIndex + 1, cursorPos).toLowerCase();

            // Determine if searching for LR or ENQ
            if (searchTerm.startsWith('lr')) {
                setSuggestionType('lr');
                setShowSuggestions(true);
            } else if (searchTerm.startsWith('enq') || searchTerm.startsWith('e')) {
                setSuggestionType('enq');
                setShowSuggestions(true);
            } else if (searchTerm === '') {
                setSuggestionType(null);
                setShowSuggestions(true);
            } else {
                setShowSuggestions(false);
            }
        } else {
            setShowSuggestions(false);
        }
    };

    const insertSuggestion = (suggestion) => {
        const lastAtIndex = input.lastIndexOf('@', cursorPosition - 1);
        const beforeAt = input.substring(0, lastAtIndex);
        const afterCursor = input.substring(cursorPosition);
        const newValue = beforeAt + suggestion.label + ' ' + afterCursor;
        setInput(newValue);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

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

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() && attachments.length === 0) return;

        const newMessage = {
            id: Date.now(),
            sender: 'me',
            text: input,
            attachments: attachments.map(a => ({ name: a.name, type: a.type, size: a.size })),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString()
        };

        setMessages([...messages, newMessage]);
        setInput('');
        setAttachments([]);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const suggestions = suggestionType === 'lr' ? lrNumbers : suggestionType === 'enq' ? enquiryIds : [...lrNumbers, ...enquiryIds];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                    Support Chat
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                    Chat with Ashwini Cargo Carrier team. Use @ to tag LR numbers or enquiries.
                </p>
            </div>

            {/* Chat Container */}
            <div style={{
                flex: 1,
                background: '#ffffff',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Messages Area */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.5rem',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {messages.map((msg, index) => {
                        const showDate = index === 0 || messages[index - 1].date !== msg.date;
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
                                    display: 'flex',
                                    justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start'
                                }}>
                                    <div style={{
                                        maxWidth: '70%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.75rem',
                                        background: msg.sender === 'me' ? '#3b82f6' : '#ffffff',
                                        color: msg.sender === 'me' ? '#ffffff' : '#0f172a',
                                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                                        borderBottomRightRadius: msg.sender === 'me' ? '0.25rem' : '0.75rem',
                                        borderBottomLeftRadius: msg.sender === 'me' ? '0.75rem' : '0.25rem'
                                    }}>
                                        {msg.text && <p style={{ fontSize: '0.875rem', marginBottom: msg.attachments?.length > 0 ? '0.5rem' : 0 }}>{msg.text}</p>}
                                        {msg.attachments?.map((att, i) => (
                                            <div key={i} style={{
                                                marginTop: '0.5rem',
                                                padding: '0.5rem',
                                                background: msg.sender === 'me' ? 'rgba(255,255,255,0.1)' : '#f8fafc',
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
                        borderTop: '1px solid #e2e8f0',
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
                                border: '1px solid #e2e8f0',
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
                                    <div style={{ fontWeight: '500', color: '#0f172a' }}>{att.name}</div>
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

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        bottom: '80px',
                        left: '1.5rem',
                        right: '1.5rem',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 10
                    }}>
                        {suggestions.slice(0, 5).map((sug, index) => (
                            <div
                                key={index}
                                onClick={() => insertSuggestion(sug)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    cursor: 'pointer',
                                    borderBottom: index < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                                    fontSize: '0.875rem',
                                    color: '#0f172a'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                            >
                                {sug.label}
                            </div>
                        ))}
                    </div>
                )}

                {/* Input Area */}
                <form onSubmit={handleSend} style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid #e2e8f0',
                    background: '#ffffff',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-end'
                }}>
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
                        style={{
                            padding: '0.625rem',
                            background: 'transparent',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#3b82f6';
                            e.currentTarget.style.color = '#3b82f6';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.color = '#64748b';
                        }}
                    >
                        <Paperclip size={20} />
                    </button>
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type a message... (use @ to tag LR or Enquiry)"
                        style={{
                            flex: 1,
                            padding: '0.625rem 1rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            outline: 'none'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: '0.625rem 1.25rem',
                            background: '#3b82f6',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                    >
                        <Send size={16} /> Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
