// c:\Users\dzikri\Downloads\absensi-app-user\client\src\pages\Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Lock, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Login() {
  const navigate = useNavigate();
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log("Login API URL:", `${API_BASE_URL}/api/login`); // Cek URL di Console (F12)

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nip, password }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        // Simpan data user dari DB ke localStorage
        localStorage.setItem('user_data', JSON.stringify(result.data));

        // Hapus penanda scan hari sebelumnya agar bisa scan lagi
        localStorage.removeItem('last_scan_date');
        localStorage.removeItem('has_scanned_out');

        // Arahkan ke scan masuk
        navigate('/scan-masuk');
      } else {
        setError(result.message || 'Terjadi kesalahan');
      }
    } catch (err) {
      setError('Gagal terhubung ke server. Cek koneksi Anda.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-white">
      {/* Background Decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-60"></div>

      <div className="w-full max-w-sm z-10">
        <div className="text-center mb-10">
          <div className="bg-red-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-200 mb-4 transform rotate-3">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Portal Petugas</h1>
          <p className="text-slate-500 text-sm mt-2">Silakan masuk untuk memulai shift.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Username / NIP</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={18} className="text-slate-400 group-focus-within:text-red-500 transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Masukkan NIP" 
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-400 group-focus-within:text-red-500 transition-colors" />
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-xs text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-red-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Masuk Sekarang'}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
        
        <p className="text-center text-xs text-slate-400 mt-8">
          &copy;  Sistem Keamanan Terpadu
        </p>
      </div>
    </div>
  );
}
