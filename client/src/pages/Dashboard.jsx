// c:\Users\dzikri\Downloads\absensi-app-user\client\src\pages\Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { MapPin, Clock, CalendarCheck, FileText, Camera, CheckSquare, AlertTriangle, Upload, BellRing, X, ZoomIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function Dashboard() {
  const navigate = useNavigate();
  const [absensiData, setAbsensiData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRemaining, setTimeRemaining] = useState("");
  const [shiftEndTime, setShiftEndTime] = useState("");
  const [hasSubmittedReport, setHasSubmittedReport] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false); // State untuk cegah double submit
  const [previewPhoto, setPreviewPhoto] = useState(null); // State untuk preview foto besar

  // GANTI DENGAN PUBLIC KEY DARI TERMINAL (Langkah 1)
  const publicVapidKey = 'BHPiVWZRGOAbki8WcDeQseoWHdbzE26wv9Ce00wccvrViehc2o2QqtHLdbDaq0ggVL9nhY1Pb6IrMyxKZ6fZiaE';
  
  // State untuk Laporan
  const [checklist, setChecklist] = useState({
      patroli: false,
      parkir: false,
      tamu: false,
      kebersihan: false
  });
  const [keterangan, setKeterangan] = useState("");
  const [foto, setFoto] = useState(null);

  // --- FUNGSI SUBSCRIBE NOTIFIKASI ---
  const subscribeToPush = async (userId) => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
            const register = await navigator.serviceWorker.ready;
            
            // Minta Izin
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return;

            // Konversi Key
            const urlBase64ToUint8Array = (base64String) => {
                const padding = '='.repeat((4 - base64String.length % 4) % 4);
                const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
                const rawData = window.atob(base64);
                const outputArray = new Uint8Array(rawData.length);
                for (let i = 0; i < rawData.length; ++i) {
                    outputArray[i] = rawData.charCodeAt(i);
                }
                return outputArray;
            };

            // Subscribe ke Browser
            const subscription = await register.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            // Kirim ke Server Database
            await fetch(`${API_BASE_URL}/api/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, subscription })
            });
            
            alert("✅ Notifikasi berhasil diaktifkan!");
        } catch (err) {
            console.error("Gagal subscribe push:", err);
            alert("Gagal mengaktifkan notifikasi. Pastikan izin diberikan.");
        }
    }
  };

  // Efek Jam Realtime
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
      // 1. Ambil data absensi dari LocalStorage
      const storedData = localStorage.getItem('absensi_data');
      
       if (storedData) {
          const data = JSON.parse(storedData);
          setAbsensiData(data);

          // Hitung Jam Keluar & Sisa Waktu
          let endHour = 15; // Default Pagi
          if (data.shift.includes("Siang")) endHour = 23;
          if (data.shift.includes("Malam")) endHour = 7;

          const now = new Date();
          const endDate = new Date();
          endDate.setHours(endHour, 0, 0, 0);
          
          // Jika shift malam dan jam sekarang > 7, berarti shift berakhir besok pagi
          if (data.shift.includes("Malam") && now.getHours() > 7) {
             endDate.setDate(endDate.getDate() + 1);
          }

          setShiftEndTime(`${endHour.toString().padStart(2, '0')}:00`);

          // Hitung selisih waktu
          const diff = endDate - now;
          if (diff > 0) {
              const hours = Math.floor(diff / (1000 * 60 * 60));
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              setTimeRemaining(`${hours} Jam ${minutes} Menit lagi`);
          } else {
              setTimeRemaining("Shift Selesai");
          }
      } else {
          // Jika belum absen
      }

      // Cek apakah sudah lapor hari ini
      const lastReport = localStorage.getItem('daily_report_date');
      if (lastReport === new Date().toLocaleDateString('id-ID')) {
          setHasSubmittedReport(true);
      }

      // Fetch Notifikasi Count
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      if (userData.id) {
        fetch(`${API_BASE_URL}/api/notifications/${userData.id}`)
            .then(res => res.json())
            .then(data => {
                if(data.status === 'success') {
                    setUnreadCount(data.data.filter(n => !n.is_read).length);
                }
            });
      }
  }, [navigate, currentTime]);

  const handleChecklistChange = (e) => {
      setChecklist({ ...checklist, [e.target.name]: e.target.checked });
  };

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          // Ubah file ke Base64 agar bisa dikirim ke Server
          const reader = new FileReader();
          reader.onloadend = () => {
              setFoto(reader.result);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmitLaporan = async (e) => {
      e.preventDefault();
      if (isSubmitting) return; // 1. CEGAH DOUBLE SUBMIT
      setIsSubmitting(true); // Kunci tombol
      
      // Kirim ke DB
      try {
        await fetch(`${API_BASE_URL}/api/laporan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: absensiData.user_id || JSON.parse(localStorage.getItem('user_data')).id,
                tanggal: new Date().toISOString().split('T')[0],
                isi_laporan: keterangan,
                checklist_json: checklist,
                foto_bukti: foto // Kirim string Base64 foto asli
            })
        });
        
        alert("Laporan Harian Berhasil Dikirim!");
        localStorage.setItem('daily_report_date', new Date().toLocaleDateString('id-ID'));
        setHasSubmittedReport(true);

      } catch (err) {
          console.error(err);
          alert("Gagal mengirim laporan. Coba lagi.");
      } finally {
          setIsSubmitting(false); // Buka kunci tombol
      }
  };

  // Data default jika belum absen (biar ga error)
  const displayData = absensiData || {
      nama: "Petugas",
      role: "-",
      jamMasuk: "--:--",
      tanggal: "-",
      lokasi: "-",
      status: "Belum Absen",
      shift: "-"
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      
      {/* MODAL PREVIEW FOTO */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setPreviewPhoto(null)}>
            <button className="absolute top-4 right-4 text-white p-2 bg-white/20 rounded-full">
                <X size={24} />
            </button>
            <img src={previewPhoto} alt="Preview Besar" className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" />
        </div>
      )}
      
      {/* 1. Header */}
      <div className="bg-red-700 pt-10 pb-20 px-6 rounded-b-[2.5rem] relative">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full border border-white/30 flex items-center justify-center text-white font-bold text-lg">
                {displayData.nama.charAt(0)}
            </div>
            <div className="text-white">
                <p className="text-xs text-red-100 opacity-80">Selamat Bertugas,</p>
                <h1 className="text-xl font-bold">{displayData.nama}</h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-red-800 px-2 py-0.5 rounded text-red-100">{displayData.role}</span>
                    
                    {/* Tombol Notifikasi di Header (Pojok Kanan) */}
                    <button 
                        onClick={() => {
                            // Cek izin dulu, kalau belum granted, minta izin (Subscribe)
                            if (Notification.permission !== 'granted') {
                                const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
                                if(userData.id) subscribeToPush(userData.id);
                            } else {
                                navigate('/notifications');
                            }
                        }} 
                        className="bg-red-800 p-1.5 rounded-full text-red-100 hover:bg-red-900 relative"
                    >
                        <BellRing size={12} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-900 text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-red-700">{unreadCount}</span>
                        )}
                    </button>

                    <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded text-white">{currentTime.toLocaleTimeString('id-ID')}</span>
                </div>
            </div>
        </div>
      </div>

      {/* 2. Kartu Status UTAMA */}
      <div className="px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden">
            {/* Header Kartu */}
            <div className={`border-b p-4 flex justify-between items-center ${absensiData ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                <div className={`flex items-center gap-2 ${absensiData ? 'text-emerald-700' : 'text-slate-500'}`}>
                    <CalendarCheck size={18} />
                    <span className="font-bold text-sm">
                        {absensiData ? "Status: SUDAH ABSEN" : "Status: BELUM ABSEN"}
                    </span>
                </div>
                {absensiData && <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>}
            </div>

            {/* Isi Detail Absen */}
            <div className="p-5 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-xs text-slate-400 uppercase font-semibold">Jam Masuk</p>
                    <p className="text-2xl font-bold text-slate-800">{displayData.jamMasuk}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-slate-400 uppercase font-semibold">Tanggal</p>
                    <p className="text-sm font-medium text-slate-700">{displayData.tanggal}</p>
                </div>
                
                {/* Info Shift & Status Keterlambatan */}
                <div className="col-span-2 grid grid-cols-2 gap-4 pt-2 border-t border-slate-50 mt-2">
                     <div className="space-y-1">
                        <p className="text-xs text-slate-400 uppercase font-semibold">Shift</p>
                        <p className="text-sm font-bold text-slate-700">{displayData.shift || '-'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-slate-400 uppercase font-semibold">Keterangan</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            displayData.isLate ? 'bg-red-100 text-red-600' : 
                            absensiData ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                            {displayData.status}
                        </span>
                    </div>
                </div>

                {/* Info Jam Keluar & Countdown */}
                {absensiData && (
                    <div className="col-span-2 bg-slate-50 rounded-lg p-3 flex justify-between items-center mt-2 border border-slate-100">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Jam Keluar</p>
                            <p className="text-lg font-bold text-slate-800">{shiftEndTime}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Sisa Waktu</p>
                            <p className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{timeRemaining}</p>
                        </div>
                    </div>
                )}

                <div className="col-span-2 pt-2 border-t border-slate-50 mt-2">
                    <div className="flex items-center gap-2 text-slate-500">
                        <MapPin size={16} className="text-red-500" />
                        <span className="text-xs">{displayData.lokasi}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 3. Form Laporan Harian (Hanya muncul jika sudah absen) */}
      {absensiData && (
        <div className="px-6 mt-8">
            {hasSubmittedReport ? (
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckSquare size={24} />
                    </div>
                    <h3 className="font-bold text-emerald-800">Laporan Harian Terkirim</h3>
                    <p className="text-sm text-emerald-600 mt-1">Anda sudah mengisi laporan hari ini.</p>
                </div>
            ) : (
            <>
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-red-600"/>
                Laporan Harian
            </h3>
            
            <form onSubmit={handleSubmitLaporan} className="space-y-4">
                {/* Checklist Kegiatan */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3">Ceklis Kegiatan</p>
                    <div className="space-y-3">
                        <CheckboxItem name="patroli" label="Patroli Keliling Area" checked={checklist.patroli} onChange={handleChecklistChange} />
                        <CheckboxItem name="parkir" label="Pengaturan Parkir" checked={checklist.parkir} onChange={handleChecklistChange} />
                        <CheckboxItem name="tamu" label="Pencatatan Tamu Masuk" checked={checklist.tamu} onChange={handleChecklistChange} />
                        <CheckboxItem name="kebersihan" label="Cek Kebersihan Pos" checked={checklist.kebersihan} onChange={handleChecklistChange} />
                    </div>
                </div>

                {/* Keterangan & Insiden */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Keterangan / Kejadian</label>
                    <textarea 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        rows="3"
                        placeholder="Tulis kondisi aman atau insiden khusus..."
                        value={keterangan}
                        onChange={(e) => setKeterangan(e.target.value)}
                    ></textarea>
                </div>

                {/* Upload Foto */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3">Dokumentasi</p>
                    
                    {!foto ? (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Camera className="w-8 h-8 text-slate-400 mb-2" />
                                <p className="text-xs text-slate-500">Tap untuk ambil foto</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    ) : (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden group">
                            <img 
                                src={foto} 
                                alt="Preview" 
                                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                                onClick={() => setPreviewPhoto(foto)} // 2. KLIK UNTUK PREVIEW
                            />
                            <button 
                                type="button"
                                onClick={() => setFoto(null)}
                                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
                            >
                                <AlertTriangle size={16} />
                            </button>
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded pointer-events-none">
                                Tap untuk perbesar
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    type="submit" 
                    disabled={isSubmitting} // 3. TOMBOL MATI SAAT LOADING
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>Memproses...</>
                    ) : (
                        <>
                            <Upload size={18} />
                            Kirim Laporan
                        </>
                    )}
                </button>
            </form>
            </>
            )}
        </div>
      )}

      {/* 4. Riwayat Singkat (Jika belum absen, tampilkan ini sebagai placeholder) */}
      {!absensiData && (
          <div className="px-6 mt-8 text-center py-10">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock size={32} className="text-slate-400" />
              </div>
              <h3 className="text-slate-600 font-bold">Belum Ada Data Absen</h3>
              <p className="text-slate-400 text-sm mt-1">Silakan scan QR Code untuk memulai shift Anda hari ini.</p>
              <button onClick={() => navigate('/scan-masuk')} className="mt-6 px-6 py-2 bg-red-600 text-white rounded-full text-sm font-bold shadow-lg shadow-red-200">
                  Scan Sekarang
              </button>
          </div>
      )}

    </div>
  );
}

function CheckboxItem({ name, label, checked, onChange }) {
    return (
        <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-red-500 border-red-500' : 'border-slate-300 bg-white'}`}>
                {checked && <CheckSquare size={14} className="text-white" />}
            </div>
            <input type="checkbox" name={name} checked={checked} onChange={onChange} className="hidden" />
            <span className={`text-sm ${checked ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>{label}</span>
        </label>
    )
}
