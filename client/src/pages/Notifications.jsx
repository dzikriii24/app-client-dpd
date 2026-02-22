import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Info, AlertTriangle, CheckCircle, Trash2, Check, CheckCheck } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Notifications() {
    const navigate = useNavigate();
    const [notifs, setNotifs] = useState([]);
    const [loading, setLoading] = useState(true);
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

    useEffect(() => {
        if (!userData.id) return;
        fetchNotifs();
    }, []);

    const fetchNotifs = () => {
        fetch(`${API_BASE_URL}/api/notifications/${userData.id}`)
            .then(res => res.json())
            .then(data => {
                if(data.status === 'success') setNotifs(data.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const handleMarkRead = async (id) => {
        await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, { method: 'PUT' });
        // Update UI lokal biar cepet
        setNotifs(notifs.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Hapus notifikasi ini?")) return;
        await fetch(`${API_BASE_URL}/api/notifications/${id}`, { method: 'DELETE' });
        setNotifs(notifs.filter(n => n.id !== id));
    };

    const handleMarkAllRead = async () => {
        await fetch(`${API_BASE_URL}/api/notifications/read-all/${userData.id}`, { method: 'PUT' });
        setNotifs(notifs.map(n => ({ ...n, is_read: 1 })));
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="bg-white p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20}/></button>
                <div className="flex-1">
                    <h1 className="font-bold text-lg text-slate-800">Notifikasi</h1>
                </div>
                {notifs.length > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs font-bold text-red-600 flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-full">
                        <CheckCheck size={14} /> Baca Semua
                    </button>
                )}
            </div>
            
            <div className="p-4 space-y-3">
                {loading && <div className="text-center py-10 text-slate-400">Memuat notifikasi...</div>}
                
                {!loading && notifs.length === 0 && (
                    <div className="text-center py-20">
                        <Bell size={48} className="text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400">Tidak ada notifikasi baru</p>
                    </div>
                )}

                {notifs.map(notif => (
                    <div 
                        key={notif.id} 
                        className={`p-4 rounded-xl border shadow-sm flex gap-4 transition-all ${
                            notif.is_read ? 'bg-white border-slate-100 opacity-70' : 'bg-white border-red-100 ring-1 ring-red-50'
                        }`}
                        onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            notif.tipe === 'warning' ? 'bg-orange-50 text-orange-500' : 
                            notif.tipe === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'
                        }`}>
                            {notif.tipe === 'warning' ? <AlertTriangle size={20} /> : 
                             notif.tipe === 'success' ? <CheckCircle size={20} /> : <Info size={20} />}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className={`font-bold text-sm ${notif.is_read ? 'text-slate-600' : 'text-slate-900'}`}>{notif.judul}</h3>
                                {!notif.is_read && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.pesan}</p>
                            <p className="text-[10px] text-slate-400 mt-2">{new Date(notif.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        
                        {/* Tombol Hapus Kecil */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                            className="self-start text-slate-300 hover:text-red-500 p-1"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}