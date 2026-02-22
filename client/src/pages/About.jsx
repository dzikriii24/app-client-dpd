import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function About() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="bg-white p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20}/></button>
                <h1 className="font-bold text-lg text-slate-800">Tentang Aplikasi</h1>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-red-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-200 transform rotate-3">
                    <ShieldCheck size={40} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Absensi DPD Jawa Barat</h2>
                <p className="text-slate-400 text-xs mt-1 font-mono">Versi 1.0.0 (Beta)</p>
                <p className="text-slate-500 text-sm mt-6 leading-relaxed">
                    Aplikasi absensi dan pelaporan digital untuk petugas keamanan. Dikembangkan untuk meningkatkan efisiensi operasional lapangan.
                </p>
                <p className="mt-auto text-xs text-slate-300 pt-10">© 2026 Sistem Keamanan Terpadu</p>
            </div>
        </div>
    );
}