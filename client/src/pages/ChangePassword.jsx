import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';

export default function ChangePassword() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="bg-white p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20}/></button>
                <h1 className="font-bold text-lg text-slate-800">Ganti Password</h1>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Lock size={32} className="text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Akses Dibatasi</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                    Untuk alasan keamanan, penggantian password hanya dapat dilakukan oleh <b>Administrator</b>.
                </p>
                <div className="mt-8 bg-blue-50 text-blue-700 p-4 rounded-xl text-xs font-medium border border-blue-100">
                    Silakan hubungi Admin IT atau HRD jika Anda lupa password atau ingin melakukan reset.
                </div>
            </div>
        </div>
    );
}