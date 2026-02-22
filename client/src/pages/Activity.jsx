import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, FileText, Clock, CheckCircle, Image as ImageIcon, AlertTriangle, X, Edit, Save, Camera, CheckSquare, Printer } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Activity() {
  const [activeTab, setActiveTab] = useState('absensi'); // 'absensi' or 'laporan'
  const [riwayatAbsen, setRiwayatAbsen] = useState([]);
  const [riwayatLaporan, setRiwayatLaporan] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [previewPhoto, setPreviewPhoto] = useState(null); // State Preview Foto
  const [editingReport, setEditingReport] = useState(null); // State Laporan yg diedit
  const [editKeterangan, setEditKeterangan] = useState(""); // State Text Edit
  const [editChecklist, setEditChecklist] = useState({}); // State Checklist Edit
  const [editFoto, setEditFoto] = useState(null); // State Foto Edit
  const [isSaving, setIsSaving] = useState(false); // Loading Simpan

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

  const handleEditClick = (laporan) => {
      setEditingReport(laporan);
      setEditKeterangan(laporan.isi_laporan || "");
      setEditChecklist({
          patroli: laporan.checklist_json?.patroli || false,
          parkir: laporan.checklist_json?.parkir || false,
          tamu: laporan.checklist_json?.tamu || false,
          kebersihan: laporan.checklist_json?.kebersihan || false,
          ...laporan.checklist_json // preserve other keys like type: EMERGENCY
      });
      setEditFoto(laporan.foto_bukti);
  };

  const handleEditChecklistChange = (e) => {
      setEditChecklist({ ...editChecklist, [e.target.name]: e.target.checked });
  };

  const handleEditFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setEditFoto(reader.result);
          reader.readAsDataURL(file);
      }
  };

  const handleSaveEdit = async () => {
      if (!editingReport) return;
      setIsSaving(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/laporan/${editingReport.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  isi_laporan: editKeterangan,
                  checklist_json: editChecklist,
                  foto_bukti: editFoto
              })
          });
          const data = await res.json();
          if (data.status === 'success') {
              setRiwayatLaporan(prev => prev.map(item => item.id === editingReport.id ? { 
                  ...item, 
                  isi_laporan: editKeterangan,
                  checklist_json: editChecklist,
                  foto_bukti: data.data?.foto_bukti || editFoto 
              } : item));
              setEditingReport(null);
              alert("✅ Laporan berhasil diperbarui!");
          } else {
              alert("Gagal update: " + data.message);
          }
      } catch (err) {
          alert("Terjadi kesalahan koneksi.");
      }
      setIsSaving(false);
  };

  const handlePrint = () => {
      window.print();
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
      
      {/* MODAL PREVIEW FOTO */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setPreviewPhoto(null)}>
            <button className="absolute top-4 right-4 text-white p-2 bg-white/20 rounded-full">
                <X size={24} />
            </button>
            <img src={previewPhoto} alt="Preview Besar" className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" />
        </div>
      )}

      {/* MODAL EDIT LAPORAN */}
      {editingReport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-slate-800">Edit Laporan</h3>
                    <button onClick={() => setEditingReport(null)} className="p-1 hover:bg-slate-100 rounded-full">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>
                
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {/* 1. Edit Checklist */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Ceklis Kegiatan</p>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="patroli" checked={editChecklist.patroli} onChange={handleEditChecklistChange} className="accent-red-600 w-4 h-4" /><span className="text-sm text-slate-700">Patroli Keliling</span></label>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="parkir" checked={editChecklist.parkir} onChange={handleEditChecklistChange} className="accent-red-600 w-4 h-4" /><span className="text-sm text-slate-700">Pengaturan Parkir</span></label>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="tamu" checked={editChecklist.tamu} onChange={handleEditChecklistChange} className="accent-red-600 w-4 h-4" /><span className="text-sm text-slate-700">Pencatatan Tamu</span></label>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="kebersihan" checked={editChecklist.kebersihan} onChange={handleEditChecklistChange} className="accent-red-600 w-4 h-4" /><span className="text-sm text-slate-700">Cek Kebersihan</span></label>
                        </div>
                    </div>

                    {/* 2. Edit Keterangan */}
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Keterangan</p>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 min-h-[100px] text-sm"
                            value={editKeterangan}
                            onChange={(e) => setEditKeterangan(e.target.value)}
                            placeholder="Perbarui keterangan laporan..."
                        ></textarea>
                    </div>

                    {/* 3. Edit Foto */}
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Foto Bukti</p>
                        <div className="relative w-full h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group">
                            {editFoto ? (
                                <img 
                                    src={editFoto.startsWith('data:') || editFoto.startsWith('http') ? editFoto : `${API_BASE_URL}${editFoto}`} 
                                    alt="Preview Edit" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400 text-xs">Belum ada foto</div>
                            )}
                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold text-xs">
                                <Camera size={20} className="mr-1" /> Ganti Foto
                                <input type="file" className="hidden" accept="image/*" onChange={handleEditFileChange} />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => setEditingReport(null)} className="px-4 py-2 text-slate-500 font-medium hover:bg-slate-50 rounded-lg">Batal</button>
                    <button 
                        onClick={handleSaveEdit} 
                        disabled={isSaving}
                        className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:bg-slate-300"
                    >
                        {isSaving ? 'Menyimpan...' : <><Save size={16} /> Simpan</>}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white pt-12 pb-4 px-6 sticky top-0 z-10 shadow-sm border-b border-slate-100 no-print">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Aktivitas Saya</h1>
                <p className="text-slate-500 text-xs mt-1">Riwayat kehadiran dan laporan harian</p>
            </div>
            <button onClick={handlePrint} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600">
                <Printer size={20} />
            </button>
        </div>
        
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

      {/* Header Khusus Print */}
      <div className="hidden print:block p-6 text-center border-b border-black mb-4">
          <h1 className="text-xl font-bold uppercase">Laporan {activeTab === 'absensi' ? 'Absensi' : 'Harian'} Petugas</h1>
          <p className="text-sm">{userData.nama} - NIP. {userData.nip}</p>
          <p className="text-xs mt-1">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
      </div>

      <div className="p-6 space-y-4">
        
        {/* TAB RIWAYAT ABSENSI */}
        {activeTab === 'absensi' && (
            <>
                {riwayatAbsen.length === 0 && (
                    <div className="text-center py-10 print:hidden">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar size={32} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 text-sm">Belum ada riwayat absen.</p>
                    </div>
                )}
                
                {/* TAMPILAN MOBILE / WEB (CARD) - HIDDEN SAAT PRINT */}
                <div className="space-y-4 print:hidden">
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
                </div>

                {/* TAMPILAN CETAK (TABEL) - HANYA MUNCUL SAAT PRINT */}
                <div className="hidden print:block">
                    <table className="w-full text-sm border-collapse border border-black">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-black p-2 text-left">No</th>
                                <th className="border border-black p-2 text-left">Tanggal</th>
                                <th className="border border-black p-2 text-left">Jam Masuk</th>
                                <th className="border border-black p-2 text-left">Jam Pulang</th>
                                <th className="border border-black p-2 text-left">Shift</th>
                                <th className="border border-black p-2 text-left">Status</th>
                                <th className="border border-black p-2 text-left">Lokasi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {riwayatAbsen.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="border border-black p-2 text-center">{index + 1}</td>
                                    <td className="border border-black p-2">{new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                    <td className="border border-black p-2">{item.jam_masuk ? item.jam_masuk.substring(0, 5) : '-'}</td>
                                    <td className="border border-black p-2">{item.jam_pulang ? item.jam_pulang.substring(0, 5) : '-'}</td>
                                    <td className="border border-black p-2">{item.shift || '-'}</td>
                                    <td className="border border-black p-2">
                                        {item.status} {item.is_late ? '(Terlambat)' : ''}
                                    </td>
                                    <td className="border border-black p-2">{item.lokasi || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </>
        )}

        {/* TAB RIWAYAT LAPORAN */}
        {activeTab === 'laporan' && (
            <>
                {riwayatLaporan.length === 0 && (
                    <div className="text-center py-10 print:hidden">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText size={32} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 text-sm">Belum ada laporan yang dikirim.</p>
                    </div>
                )}

                {/* TAMPILAN MOBILE / WEB (CARD) - HIDDEN SAAT PRINT */}
                <div className="space-y-4 print:hidden">
                {riwayatLaporan.map((laporan) => (
                    <div key={laporan.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
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
                            <div className="flex items-center gap-2">
                                {laporan.checklist_json?.type === 'EMERGENCY' && (
                                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">DARURAT</span>
                                )}
                                {/* Tombol Edit */}
                                <button onClick={() => handleEditClick(laporan)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit size={16} />
                                </button>
                            </div>
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
                                        onClick={() => setPreviewPhoto(laporan.foto_bukti.startsWith('data:') || laporan.foto_bukti.startsWith('http') ? laporan.foto_bukti : `${API_BASE_URL}${laporan.foto_bukti}`)}
                                        onError={(e) => {e.target.src = 'https://placehold.co/600x400?text=Gagal+Muat+Gambar';}}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                </div>

                {/* TAMPILAN CETAK (TABEL) - HANYA MUNCUL SAAT PRINT */}
                <div className="hidden print:block">
                    <table className="w-full text-sm border-collapse border border-black">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-black p-2 text-left">No</th>
                                <th className="border border-black p-2 text-left">Tanggal & Waktu</th>
                                <th className="border border-black p-2 text-left">Jenis</th>
                                <th className="border border-black p-2 text-left">Isi Laporan</th>
                                <th className="border border-black p-2 text-left">Aktivitas</th>
                                <th className="border border-black p-2 text-left">Foto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {riwayatLaporan.map((laporan, index) => (
                                <tr key={laporan.id}>
                                    <td className="border border-black p-2 text-center">{index + 1}</td>
                                    <td className="border border-black p-2">
                                        {new Date(laporan.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        <br/>
                                        <span className="text-xs text-gray-600">
                                            {laporan.created_at ? new Date(laporan.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </span>
                                    </td>
                                    <td className="border border-black p-2">
                                        {laporan.checklist_json?.type === 'EMERGENCY' ? <span className="font-bold text-red-600">DARURAT</span> : 'Harian'}
                                    </td>
                                    <td className="border border-black p-2">{laporan.isi_laporan || '-'}</td>
                                    <td className="border border-black p-2">
                                        {laporan.checklist_json && !laporan.checklist_json.type ? (
                                            <ul className="list-disc list-inside text-xs">
                                                {Object.entries(laporan.checklist_json).map(([key, val]) => (
                                                    val && <li key={key} className="capitalize">{key.replace(/_/g, ' ')}</li>
                                                ))}
                                            </ul>
                                        ) : '-'}
                                    </td>
                                    <td className="border border-black p-2 text-center">
                                        {laporan.foto_bukti ? 'Ada' : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </>
        )}

      </div>

      {/* CSS KHUSUS PRINT */}
      <style>{`
        @media print {
            .no-print, nav, .fixed, .print\\:hidden { display: none !important; }
            body { background: white; }
            .min-h-screen { min-height: auto; padding-bottom: 0; }
            .print\\:block { display: block !important; }
            .print\\:border-black { border-color: #000 !important; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
        }
      `}</style>
    </div>
  );
}