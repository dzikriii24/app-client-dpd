import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, ChevronRight, Bell, Lock, HelpCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const userDataString = localStorage.getItem('user_data');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setUser(userData);

      // Fetch Notifikasi Count
      fetch(`${API_BASE_URL}/api/notifications/${userData.id}`)
        .then(res => res.json())
        .then(data => {
            if(data.status === 'success') {
                setUnreadCount(data.data.filter(n => !n.is_read).length);
            }
        });
    } else {
      // Jika tidak ada data user, tendang ke login
      navigate('/login');
    }
  }, [navigate]);

  // Tampilkan loading jika data user belum siap
  if (!user) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      
      {/* 1. Header Profile */}
      <div className="bg-white px-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-sm border-b border-slate-100">
        <div className="flex flex-col items-center">
            {/* Foto Profil */}
            <div className="relative">
                <div className="w-24 h-24 bg-slate-200 rounded-full overflow-hidden border-4 border-slate-50 shadow-md">
                    <img 
                        src={user.foto_profil ? `${API_BASE_URL}${user.foto_profil}` : `https://ui-avatars.com/api/?name=${user.nama.replace(' ', '+')}&background=ef4444&color=fff&font-size=0.33`} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                    />
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
                    <User size={14} className="text-white" />
                </div>
            </div>
            
            {/* Nama & Role */}
            <div className="text-center mt-4">
                <h2 className="text-xl font-bold text-slate-800">{user.nama}</h2>
                <p className="text-sm text-slate-500 font-medium">NIP. {user.nip}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full">
                    {user.role}
                </span>
            </div>
        </div>
      </div>

      {/* 2. Menu Settings */}
      <div className="px-6 mt-8 space-y-6">
        
        {/* Group 1: Akun */}
        <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">Pengaturan Akun</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <MenuItem icon={<User size={18} />} label="Edit Profil" onClick={() => navigate('/profile/edit')} />
                <MenuItem icon={<Lock size={18} />} label="Ganti Password" onClick={() => navigate('/change-password')} />
                <MenuItem icon={<Bell size={18} />} label="Notifikasi" badge={unreadCount > 0 ? unreadCount : null} onClick={() => navigate('/notifications')} />
            </div>
        </div>

        {/* Group 2: Lainnya */}
        <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">Lainnya</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <MenuItem icon={<HelpCircle size={18} />} label="Bantuan & CS" onClick={() => navigate('/help')} />
                <MenuItem icon={<Settings size={18} />} label="Tentang Aplikasi" onClick={() => navigate('/about')} />
            </div>
        </div>

        <p className="text-center text-xs text-slate-300 pb-4">Version 1.0.0 Beta</p>
      </div>

    </div>
  );
}

// Komponen Kecil untuk List Item
function MenuItem({ icon, label, badge, onClick }) {
    return (
        <button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
            <div className="flex items-center gap-3 text-slate-600">
                {icon}
                <span className="text-sm font-medium text-slate-700">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {badge && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>}
                <ChevronRight size={16} className="text-slate-300" />
            </div>
        </button>
    )
}