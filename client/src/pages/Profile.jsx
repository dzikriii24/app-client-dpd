import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronRight, Bell, Lock, HelpCircle } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userDataString = localStorage.getItem('user_data');
    if (userDataString) {
      setUser(JSON.parse(userDataString));
    } else {
      // Jika tidak ada data user, tendang ke login
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    // Hapus semua data sesi dari localStorage untuk logout bersih
    localStorage.removeItem('user_data');
    localStorage.removeItem('absensi_data');
    localStorage.removeItem('last_scan_date');
    localStorage.removeItem('has_scanned_out');
    localStorage.removeItem('daily_report_date');

    // Arahkan kembali ke login
    navigate('/login');
  };

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
                    <img src={`https://ui-avatars.com/api/?name=${user.nama.replace(' ', '+')}&background=ef4444&color=fff&font-size=0.33`} alt="Profile" className="w-full h-full object-cover" />
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
                <MenuItem icon={<Bell size={18} />} label="Notifikasi" badge="2" onClick={() => navigate('/notifications')} />
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

        {/* 3. Tombol Logout */}
        <button 
            onClick={handleLogout}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 border border-red-100"
        >
            <LogOut size={20} />
            Keluar Aplikasi
        </button>
        
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