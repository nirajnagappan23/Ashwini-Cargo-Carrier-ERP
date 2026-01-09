import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Monitor, Smartphone, RefreshCw, ExternalLink, MonitorOff } from 'lucide-react';

const ClientDashboardView = () => {
    const { clients } = useAdmin();
    const [selectedClient, setSelectedClient] = useState('');
    const [viewMode, setViewMode] = useState('desktop'); // 'desktop' or 'mobile'
    const [iframeKey, setIframeKey] = useState(0);
    const [isMobileDevice, setIsMobileDevice] = useState(window.innerWidth < 768); // Lowered threshold

    const clientAppUrl = 'http://localhost:5173';

    useEffect(() => {
        const handleResize = () => setIsMobileDevice(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleClientChange = (e) => {
        setSelectedClient(e.target.value);
        setIframeKey(prev => prev + 1); // Force reload
    };

    const handleRefresh = () => {
        setIframeKey(prev => prev + 1);
    };

    if (isMobileDevice) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
                <MonitorOff size={64} className="mb-6 text-slate-300" />
                <h2 className="text-xl font-bold mb-2 text-slate-700">Desktop Only Feature</h2>
                <p className="max-w-md">The Client Screen Mirroring feature requires a larger display area and is available only on Desktop Web Browsers.</p>
                <p className="text-sm mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg inline-block border border-yellow-100">
                    Please access the Admin Panel on a PC or Laptop to use this tool.
                </p>
                <button
                    onClick={() => setIsMobileDevice(false)}
                    className="mt-6 text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
                >
                    I am on a large screen, show me anyway
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Monitor className="text-purple-600" />
                        Client View
                    </h1>

                    <select
                        className="select border-purple-200 focus:border-purple-500 rounded-md"
                        value={selectedClient}
                        onChange={handleClientChange}
                    >
                        <option value="">-- Select Client to View --</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.companyName})</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <div className="bg-white border rounded-lg p-1 flex">
                        <button
                            onClick={() => setViewMode('desktop')}
                            className={`p-2 rounded ${viewMode === 'desktop' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}
                            title="Desktop View"
                        >
                            <Monitor size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('mobile')}
                            className={`p-2 rounded ${viewMode === 'mobile' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}
                            title="Mobile View"
                        >
                            <Smartphone size={20} />
                        </button>
                    </div>

                    <button onClick={handleRefresh} className="btn btn-ghost" title="Refresh View">
                        <RefreshCw size={20} />
                    </button>

                    {selectedClient && (
                        <a
                            href={`${clientAppUrl}/?impersonate=${selectedClient}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline gap-2"
                        >
                            <ExternalLink size={16} /> Open in New Tab
                        </a>
                    )}
                </div>
            </div>

            <div className="flex-1 bg-slate-100 rounded-lg border border-slate-300 overflow-hidden relative flex justify-center p-4">
                {!selectedClient ? (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <Monitor size={64} className="mb-4 opacity-50" />
                        <p className="text-lg font-medium">Select a client to view their dashboard</p>
                    </div>
                ) : (
                    <div
                        className={`transition-all duration-300 shadow-2xl bg-white ${viewMode === 'mobile' ? 'w-[375px] h-[667px] rounded-3xl border-8 border-slate-800' : 'w-full h-full rounded-md'}`}
                        style={viewMode === 'mobile' ? { marginTop: '1rem' } : {}}
                    >
                        <iframe
                            key={`${selectedClient}-${iframeKey}`}
                            src={`${clientAppUrl}/?impersonate=${selectedClient}`}
                            title="Client View"
                            className="w-full h-full"
                            style={{ border: 'none' }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientDashboardView;
