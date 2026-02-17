// c:\Users\dzikri\Downloads\absensi-app-user\client\src\pages\TestQrGenerator.jsx

import React from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TestQrGenerator() {
  const navigate = useNavigate();
  
  // Ini adalah "Kunci" yang dicari oleh scanner
  const qrValue = "POS-JAGA-UTAMA";
  
  // Menggunakan API publik untuk generate gambar QR
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrValue}`;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <button 
        onClick={() => navigate('/login')} 
        className="absolute top-6 left-6 p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
      >
        <ArrowLeft size={24} className="text-slate-700" />
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">QR Code Pos Jaga</h1>
        <p className="text-slate-500 mt-2 text-sm max-w-xs mx-auto">
          Silakan scan QR Code di bawah ini menggunakan menu <b>Scan Masuk</b> atau <b>Scan Pulang</b> pada aplikasi.
        </p>
      </div>
      
      <div className="p-6 border-4 border-slate-900 rounded-3xl shadow-2xl bg-white">
        <img src={qrUrl} alt="QR Code Pos Jaga" className="w-64 h-64 object-contain" />
      </div>
      
      <div className="mt-8 bg-slate-50 px-6 py-4 rounded-xl border border-slate-200">
        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Isi Data QR</p>
        <p className="font-mono text-lg font-bold text-slate-700 tracking-wider">{qrValue}</p>
      </div>

      <div className="mt-8 flex gap-2 text-xs text-slate-400">
        <Printer size={14} />
        <span>Cetak dan tempel di lokasi pos jaga</span>
      </div>
    </div>
  );
}
