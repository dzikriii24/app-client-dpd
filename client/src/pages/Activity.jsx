import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, FileText, Clock, CheckCircle, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Activity() {
  const [activeTab, setActiveTab] = useState('absensi'); // 'absensi' or 'laporan'
  const [riwayatAbsen, setRiwayatAbsen] = useState([]);
  const [riwayatLaporan, setRiwayatLaporan] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ambil data user dari localStorage
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

  useEffect(() => {
    if (userData.id) {
        setLoading(true);

        // Mengambil data absensi dan laporan secara bersamaan
        const absenPromise = fetch(`${API_BASE_URL}/api/riwayat-absensi/${userData.id}`).then(res => res.json());
        const laporanPromise = fetch(`${API_BASE_URL}/api/riwayat-laporan/${userData.id}`).then(res => res.json());

        Promise.all([absenPromise, laporanPromise])
            .then(([absenResult, laporanResult]) => {
                if (absenResult.status === 'success') {
                    setRiwayatAbsen(absenResult.data);
                }
                if (laporanResult.status === 'success') {
                    setRiwayatLaporan(laporanResult.data);
                }
            })
            .catch(error => {
                console.error("Gagal mengambil data riwayat:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    } else {
        setLoading(false);
    }
  }, []);

  const toggleExpand = (id) => {
      setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 pb-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <div className="bg-white pt-12 pb-4 px-6 sticky top-0 z-10 shadow-sm border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">Aktivitas Saya</h1>
        <p className="text-slate-500 text-xs mt-1">Riwayat kehadiran dan laporan harian</p>
        
        {/* Tabs */}
        <div className="flex mt-6 bg-slate-100 p-1 rounded-xl">
            <button 
                onClick={() => setActiveTab('absensi')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'absensi' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Riwayat Absen
            </button>
            <button 
                onClick={() => setActiveTab('laporan')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'laporan' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Laporan Harian
            </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        
        {/* TAB RIWAYAT ABSENSI */}
        {activeTab === 'absensi' && (
            <>
                {riwayatAbsen.length === 0 && (
                    <div className="text-center py-10">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar size={32} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 text-sm">Belum ada riwayat absen.</p>
                    </div>
                )}
                
                {riwayatAbsen.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div 
                            onClick={() => toggleExpand(item.id)}
                            className="p-4 flex items-center justify-between cursor-pointer active:bg-slate-50"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.is_late ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">
                                        {new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{item.shift || '-'}</span>
                                        {item.is_late && <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">Terlambat</span>}
                                    </div>
                                </div>
                            </div>
                            {expandedId === item.id ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
                        </div>

                        {/* Detail Expand */}
                        {expandedId === item.id && (
                            <div className="bg-slate-50/50 p-4 border-t border-slate-100 text-sm grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                                <div className="bg-white p-3 rounded-lg border border-slate-100">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Jam Masuk</p>
                                    <div className="flex items-center gap-2 font-bold text-slate-700 text-lg">
                                        <Clock size={16} className="text-emerald-500"/>
                                        {item.jam_masuk ? item.jam_masuk.substring(0, 5) : '--:--'}
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-slate-100">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Jam Pulang</p>
                                    <div className="flex items-center gap-2 font-bold text-slate-700 text-lg">
                                        <Clock size={16} className="text-red-500"/>
                                        {item.jam_pulang ? item.jam_pulang.substring(0, 5) : '--:--'}
                                    </div>
                                </div>
                                <div className="col-span-2 bg-white p-3 rounded-lg border border-slate-100">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Status Kehadiran</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${item.is_late ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                                        <span className="font-medium text-slate-700">{item.status}</span>
                                    </div>
                                    {item.lokasi && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><div className="w-3 h-3 rounded-full border border-slate-300 flex items-center justify-center text-[8px]">📍</div> {item.lokasi}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </>
        )}

        {/* TAB RIWAYAT LAPORAN */}
        {activeTab === 'laporan' && (
            <>
                {riwayatLaporan.length === 0 && (
                    <div className="text-center py-10">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText size={32} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 text-sm">Belum ada laporan yang dikirim.</p>
                    </div>
                )}

                {riwayatLaporan.map((laporan) => (
                    <div key={laporan.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${laporan.checklist_json?.type === 'EMERGENCY' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {laporan.checklist_json?.type === 'EMERGENCY' ? <AlertTriangle size={20} /> : <FileText size={20} />}
                                </div>
                                <div>
                                    <span className="font-bold text-slate-800 text-sm block">
                                        {new Date(laporan.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                        <span>Laporan Harian</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={10} />
                                            {laporan.created_at ? new Date(laporan.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '00:00'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {laporan.checklist_json?.type === 'EMERGENCY' && (
                                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">DARURAT</span>
                            )}
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Keterangan</p>
                            <p className="text-sm text-slate-600 italic">"{laporan.isi_laporan || 'Tidak ada keterangan tambahan.'}"</p>
                        </div>
                        
                        {/* Preview Checklist */}
                        {laporan.checklist_json && Object.keys(laporan.checklist_json).length > 0 && !laporan.checklist_json.type && (
                            <div className="mb-4">
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-wider">Aktivitas Terlaksana</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(laporan.checklist_json).map(([key, val]) => (
                                val && (
                                    <span key={key} className="flex items-center gap-1.5 text-[10px] font-medium bg-white text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                                        <CheckCircle size={12} className="text-emerald-500" /> 
                                        <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                                    </span>
                                )
                            ))}
                                </div>
                            </div>
                        )}

                        {/* Lampiran Foto */}
                        {laporan.foto_bukti && (
                            <div className="mt-2">
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-wider flex items-center gap-1">
                                    <ImageIcon size={12} /> Lampiran Foto
                                </p>
                                <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                    <img 
                                        src={laporan.foto_bukti.startsWith('data:') || laporan.foto_bukti.startsWith('http') ? laporan.foto_bukti : `${API_BASE_URL}${laporan.foto_bukti}`} 
                                        alt="Bukti Laporan" 
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {e.target.src = 'https://placehold.co/600x400?text=Gagal+Muat+Gambar';}}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </>
        )}

      </div>
    </div>
  );
}