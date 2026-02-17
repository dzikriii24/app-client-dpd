import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Notifications() {
    const navigate = useNavigate();
    const [notifs, setNotifs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/notifications`)
            .then(res => res.json())
            .then(data => {
                if(data.status === 'success') setNotifs(data.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="bg-white p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20}/></button>
                <h1 className="font-bold text-lg text-slate-800">Notifikasi</h1>
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
                    <div key={notif.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            notif.type === 'warning' ? 'bg-orange-50 text-orange-500' : 
                            notif.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'
                        }`}>
                            {notif.type === 'warning' ? <AlertTriangle size={20} /> : 
                             notif.type === 'success' ? <CheckCircle size={20} /> : <Info size={20} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">{notif.title}</h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 mt-2">{new Date(notif.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}