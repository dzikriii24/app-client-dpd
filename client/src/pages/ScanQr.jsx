import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, CameraOff, MapPin, Flashlight } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { API_BASE_URL } from '../config';

export default function ScanQR({ type }) {
  const navigate = useNavigate();
  const [isError, setIsError] = useState(false);
  const scannerRef = useRef(null);
  
  // State untuk UI
  const title = type === 'masuk' ? "Absen Masuk" : "Absen Pulang";
  const subtitle = type === 'masuk' ? "Scan QR Code Pos Jaga" : "Scan QR untuk pulang";

  // --- 1. LOGIKA UTAMA ABSENSI ---
  const processAbsensi = async (decodedText) => {
    // A. Validasi String QR (Harus sama dengan generator)
    if (decodedText !== "POS-JAGA-UTAMA") {
      alert("❌ QR Code Salah!\nPastikan Anda scan QR yang benar di Pos Jaga.");
      return; // Jangan stop scanner, biarkan user coba lagi
    }

    // B. Stop Scanner dulu sebelum pindah halaman (PENTING)
    if (scannerRef.current) {
        try {
            scannerRef.current.pause(); // Pause biar freeze frame saat sukses
        } catch (err) {
            // Ignore error jika scanner tidak aktif (misal saat klik tombol Dev Mode tanpa kamera)
        }
    }

    // C. Cek Data Harian
    const todayStr = new Date().toLocaleDateString('id-ID');
    const lastScanDate = localStorage.getItem('last_scan_date');
    const hasScannedOut = localStorage.getItem('has_scanned_out');

    if (type === 'masuk' && lastScanDate === todayStr) {
      alert("⚠️ Anda sudah melakukan Scan Masuk hari ini!");
      navigate('/dashboard');
      return;
    } 
    
    if (type === 'pulang' && hasScannedOut === todayStr) {
       alert("⚠️ Anda sudah Scan Pulang hari ini.");
       navigate('/dashboard'); // Balik dashboard aja
       return;
    }

    // D. Hitung Shift & Waktu
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    let shiftName = "Shift Malam";
    let shiftStartHour = 23;
    if (currentHour >= 7 && currentHour < 15) {
        shiftName = "Shift Pagi";
        shiftStartHour = 7;
    } else if (currentHour >= 15 && currentHour < 23) {
        shiftName = "Shift Siang";
        shiftStartHour = 15;
    }

    // Hitung status keterlambatan (toleransi 15 menit)
    let status = "Tepat Waktu";
    let isLate = false;
    if (currentHour > shiftStartHour || (currentHour === shiftStartHour && currentMinute > 15)) {
        status = "Terlambat";
        isLate = true;
    }

    // E. Simpan Data ke LocalStorage
    const userDataString = localStorage.getItem('user_data');
    if (!userDataString) {
        alert("Sesi Anda tidak valid. Silakan login kembali.");
        navigate('/login');
        return;
    }
    const userData = JSON.parse(userDataString);
    
    const absensiData = {
        user_id: userData.id, // Penting untuk DB
        ...userData,
        jamMasuk: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + " WIB",
        tanggal: now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        lokasi: "Pos Jaga Utama",
        shift: shiftName,
        status: status,
        isLate: isLate,
        qrCode: decodedText,
        timestamp: now.toISOString()
    };

    // Efek Getar HP (Haptic Feedback) jika didukung browser
    if (navigator.vibrate) navigator.vibrate(200);

    if (type === 'masuk') {
        // 1. Simpan ke LocalStorage (untuk UI cepat)
        localStorage.setItem('absensi_data', JSON.stringify(absensiData));
        localStorage.setItem('last_scan_date', todayStr);

        // 2. Kirim ke Database
        try {
            await fetch(`${API_BASE_URL}/api/absensi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userData.id,
                    tanggal: now.toISOString().split('T')[0], // Format YYYY-MM-DD
                    jam_masuk: now.toLocaleTimeString('en-GB'), // Format HH:MM:SS
                    shift: shiftName,
                    status: status,
                    is_late: isLate,
                    lokasi: "Pos Jaga Utama",
                    qr_code_data: decodedText
                })
            });
        } catch (error) {
            console.error("Gagal simpan ke DB", error);
        }

        alert(`✅ Absen Masuk Berhasil!\n${shiftName}`);
        navigate('/dashboard');
    } else {
        // LOGIKA PULANG
        // Kirim update jam pulang ke DB
        await fetch(`${API_BASE_URL}/api/absensi-pulang`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userData.id,
                tanggal: now.toISOString().split('T')[0],
                jam_pulang: now.toLocaleTimeString('en-GB')
            })
        });

        localStorage.setItem('has_scanned_out', todayStr);
        // Hapus data absen biar besok bersih, atau simpan ke history (disini kita hapus sesi aktif aja)
        localStorage.removeItem('absensi_data'); 
        setTimeout(() => {
            alert("✅ Absen Pulang Berhasil! Hati-hati di jalan.");
            navigate('/login'); // Arahkan ke login setelah absen pulang
        }, 300);
    }
  };

  // --- 2. SETUP SCANNER ---
  useEffect(() => {
    // Cegah inisialisasi ganda di React Strict Mode
    if (scannerRef.current) return;

    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
        try {
            // Config agar kamera tajam & full screen
            const config = { 
                fps: 15, // Frame per second lebih tinggi biar smooth
                qrbox: { width: 250, height: 250 }, // Kotak fokus scanning
                aspectRatio: window.innerHeight / window.innerWidth, // Rasio layar HP (Portrait)
                videoConstraints: {
                    facingMode: "environment", // Kamera Belakang
                    focusMode: "continuous" // Autofocus
                }
            };

            await html5QrCode.start(
                { facingMode: "environment" }, 
                config,
                (decodedText) => {
                    // Jika sukses scan
                    processAbsensi(decodedText);
                },
                (errorMessage) => {
                    // Error frame biasa (abaikan agar console bersih)
                }
            );
        } catch (err) {
            console.error("Gagal start kamera:", err);
            setIsError(true);
        }
    };

    startScanner();

    // Cleanup: Matikan kamera saat user keluar halaman / tekan back
    return () => {
        if (html5QrCode.isScanning) {
            html5QrCode.stop().then(() => {
                html5QrCode.clear();
            }).catch(err => console.error("Stop failed", err));
        }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      
      {/* 1. Header Floating */}
      <div className="absolute top-0 left-0 w-full p-6 z-20 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent pb-12">
        <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/20 transition-all active:scale-95"
        >
            {type === 'pulang' ? <X size={24} /> : <ArrowLeft size={24} />}
        </button>
        
        <div className="flex flex-col items-center">
            <span className="text-white font-bold text-lg tracking-wide">{title}</span>
            <span className="text-white/60 text-xs">{subtitle}</span>
        </div>
        
        <div className="w-12"></div> {/* Spacer dummy biar tengah */}
      </div>

      {/* 2. AREA KAMERA UTAMA */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        
        {/* Container Render Html5Qrcode */}
        <div id="reader" className="w-full h-full absolute inset-0 object-cover"></div>

        {/* Jika Error Kamera */}
        {isError && (
            <div className="relative z-30 text-center p-8 bg-neutral-900 rounded-2xl border border-neutral-800 mx-6">
                <CameraOff size={48} className="text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Kamera Bermasalah</h3>
                <p className="text-neutral-400 text-sm mb-6">Pastikan izin kamera aktif di browser Anda.</p>
                <button 
                    onClick={() => processAbsensi("POS-JAGA-UTAMA")} 
                    className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-neutral-200 transition-colors"
                >
                    Simulasi Scan (Dev Mode)
                </button>
            </div>
        )}

        {/* OVERLAY VISUAL (Agar kamera tidak terlihat kotak doang) */}
        {!isError && (
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
                
                {/* Overlay Gelap di sekeliling kotak */}
                <div className="absolute inset-0 bg-black/40 mask-scan"></div>

                {/* Kotak Fokus Scanner */}
                <div className="w-72 h-72 relative z-20">
                    {/* Sudut Merah Elegan */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-[6px] border-l-[6px] border-red-500 rounded-tl-3xl"></div>
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-[6px] border-r-[6px] border-red-500 rounded-tr-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[6px] border-l-[6px] border-red-500 rounded-bl-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[6px] border-r-[6px] border-red-500 rounded-br-3xl"></div>
                    
                    {/* Animasi Laser Scan */}
                    <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_20px_rgba(239,68,68,1)] animate-scan"></div>
                </div>

                <p className="text-white/80 mt-10 text-sm font-medium bg-black/30 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 animate-pulse">
                    Arahkan kamera ke QR Code
                </p>
            </div>
        )}
      </div>

      {/* 3. Footer Info Lokasi */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-10 px-6 z-20">
         <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-full">
                    <MapPin size={20} className="text-emerald-500" />
                </div>
                <div>
                    <p className="text-white font-bold text-sm">Lokasi Terkunci</p>
                    <p className="text-emerald-400 text-xs">Radius kantor: ±5 meter</p>
                </div>
             </div>
             {/* Hiasan Visual */}
             <div className="flex gap-1">
                 <div className="w-1 h-4 bg-red-600 rounded-full animate-bounce"></div>
                 <div className="w-1 h-6 bg-red-600 rounded-full animate-bounce delay-75"></div>
                 <div className="w-1 h-3 bg-red-600 rounded-full animate-bounce delay-150"></div>
             </div>
         </div>
{/*  */}
         {/* Tombol Khusus Development Mode */}
         {process.env.NODE_ENV === 'development' && (
            <button
                onClick={() => processAbsensi("POS-JAGA-UTAMA")}
                className="w-full mt-6 bg-yellow-500/10 text-yellow-400 text-xs font-bold py-3 rounded-xl border border-yellow-500/20 active:scale-95 transition-transform"
            >
                DEV MODE: Simulasi Scan Berhasil
            </button>
         )}

      </div>

      {/* CSS Tambahan Khusus Halaman Ini */}
      <style>{`
        /* Animasi Laser Naik Turun */
        @keyframes scan {
          0% { top: 5%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 95%; opacity: 0; }
        }
        .animate-scan {
            animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        /* Paksa Video Full Cover */
        #reader {
            border: none !important;
        }
        #reader video {
            object-fit: cover !important;
            width: 100% !important;
            height: 100% !important;
            border-radius: 0 !important;
        }
        
        /* Sembunyikan elemen bawaan html5-qrcode yg jelek */
        #reader__dashboard_section_csr span, 
        #reader__dashboard_section_swaplink {
            display: none !important;
        }
      `}</style>
    </div>
  );
}