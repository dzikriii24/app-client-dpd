import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail } from 'lucide-react';

export default function Help() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20}/></button>
                <h1 className="font-bold text-lg text-slate-800">Bantuan & CS</h1>
            </div>
            <div className="p-6 space-y-4">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-2">Kontak Darurat</h3>
                    <p className="text-sm text-slate-500 mb-4">Hubungi nomor berikut jika terjadi kendala aplikasi:</p>
                    <a href="tel:081234567890" className="flex items-center gap-3 text-red-600 font-bold bg-red-50 p-3 rounded-lg mb-2">
                        <Phone size={18} /> 0812-3456-7890 (IT Support)
                    </a>
                    <a href="mailto:admin@kantor.com" className="flex items-center gap-3 text-slate-600 font-medium bg-slate-50 p-3 rounded-lg">
                        <Mail size={18} /> admin@kantor.com
                    </a>
                </div>
            </div>
        </div>
    );
}