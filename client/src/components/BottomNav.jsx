import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Camera, FileText, AlertTriangle, User } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Fungsi untuk cek menu aktif
  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-slate-200 pb-safe pt-2 px-6 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-between items-center pb-4">
        
        {/* 1. Dashboard */}
        <button 
            onClick={() => navigate('/dashboard')}
            className={`flex flex-col items-center gap-1 transition-colors ${isActive('/dashboard') ? 'text-red-600' : 'text-slate-400 hover:text-red-500'}`}
        >
          <LayoutDashboard size={24} strokeWidth={isActive('/dashboard') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Beranda</span>
        </button>

        {/* 2. Laporan Darurat (Baru) */}
        <button 
            onClick={() => navigate('/emergency')}
            className={`flex flex-col items-center gap-1 transition-colors ${isActive('/emergency') ? 'text-red-600' : 'text-slate-400 hover:text-red-500'}`}
        >
          <AlertTriangle size={24} strokeWidth={isActive('/emergency') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Darurat</span>
        </button>

        {/* 3. Tombol Tengah (Scan Pulang) */}
        <div className="relative -top-5">
            <button 
                onClick={() => navigate('/scan-pulang')}
                className="bg-red-600 text-white p-4 rounded-full shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all border-4 border-slate-50"
            >
                <Camera size={28} />
            </button>
        </div>

        {/* 4. Profile (Dikembalikan) */}
        <button 
            onClick={() => navigate('/profile')}
            className={`flex flex-col items-center gap-1 transition-colors ${isActive('/profile') ? 'text-red-600' : 'text-slate-400 hover:text-red-500'}`}
        >
          <User size={24} strokeWidth={isActive('/profile') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Profil</span>
        </button>

        {/* 5. Aktivitas */}
        <button 
            onClick={() => navigate('/activity')}
            className={`flex flex-col items-center gap-1 transition-colors ${isActive('/activity') ? 'text-red-600' : 'text-slate-400 hover:text-red-500'}`}
        >
          <FileText size={24} strokeWidth={isActive('/activity') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Aktifitas</span>
        </button>

      </div>
    </div>
  );
}