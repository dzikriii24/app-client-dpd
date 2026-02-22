// c:\Users\dzikri\Downloads\absensi-app-user\client\src\pages\Emergency.jsx

import React, { useState } from 'react';
import { AlertTriangle, Camera, Send, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function Emergency() {
  const navigate = useNavigate();
  const [laporan, setLaporan] = useState("");
  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null); // State untuk preview foto

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setFoto(reader.result);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // 1. CEGAH DOUBLE SUBMIT
    if(!laporan) return alert("Isi keterangan kejadian!");
    
    setLoading(true); // Kunci tombol
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

    try {
        await fetch(`${API_BASE_URL}/api/laporan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userData.id,
                tanggal: new Date().toISOString().split('T')[0],
                isi_laporan: `[DARURAT] ${laporan}`,
                checklist_json: { type: 'EMERGENCY' },
                foto_bukti: foto
            })
        });
        alert("🚨 Laporan Darurat Terkirim! Tim pusat akan segera merespons.");
        navigate('/dashboard');
    } catch (error) {
        alert("Gagal mengirim laporan.");
    }
    setLoading(false); // Buka kunci (jika gagal)
  };

  return (
    <div className="min-h-screen bg-red-50 pb-32">
      {/* MODAL PREVIEW FOTO (ZOOM) */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setPreviewPhoto(null)}>
            <button className="absolute top-4 right-4 text-white p-2 bg-white/20 rounded-full">
                <X size={24} />
            </button>
            <img src={previewPhoto} alt="Preview Besar" className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" />
        </div>
      )}

      {/* Header Merah */}
      <div className="bg-red-600 p-6 pt-10 pb-16 rounded-b-[2.5rem] relative">
        <button onClick={() => navigate(-1)} className="absolute top-10 left-6 text-white/80 hover:text-white">
            <ArrowLeft size={24} />
        </button>
        <div className="text-center text-white">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <AlertTriangle size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold">Laporan Darurat</h1>
            <p className="text-red-100 text-sm mt-1">Gunakan hanya untuk keadaan mendesak!</p>
        </div>
      </div>

      <div className="px-6 -mt-10 relative z-10">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl shadow-red-100 border border-red-100 space-y-6">
            
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Deskripsi Kejadian</label>
                <textarea 
                    className="w-full bg-red-50/50 border border-red-100 rounded-xl p-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 min-h-[120px]"
                    placeholder="Jelaskan situasi darurat secara singkat dan jelas..."
                    value={laporan}
                    onChange={(e) => setLaporan(e.target.value)}
                ></textarea>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Bukti Foto (Wajib)</label>
                {!foto ? (
                    <label className="w-full h-32 border-2 border-dashed border-red-200 rounded-xl flex flex-col items-center justify-center bg-red-50/30 hover:bg-red-50 transition-colors text-red-400 cursor-pointer">
                        <Camera size={24} className="mb-2" />
                        <span className="text-xs font-medium">Ambil Foto Kejadian</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                ) : (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-red-200">
                        <img 
                            src={foto} 
                            alt="Preview" 
                            className="w-full h-full object-cover cursor-pointer" 
                            onClick={() => setPreviewPhoto(foto)} // 2. KLIK UNTUK PREVIEW
                        />
                        <button 
                            type="button"
                            onClick={() => setFoto(null)}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
                        >
                            <AlertTriangle size={16} />
                        </button>
                    </div>
                )}
            </div>

            <button 
                type="submit" 
                disabled={loading} // 3. TOMBOL MATI SAAT LOADING
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                {loading ? 'Mengirim...' : (
                    <>
                        <Send size={18} />
                        Kirim Laporan Darurat
                    </>
                )}
            </button>
        </form>
      </div>
    </div>
  );
}
