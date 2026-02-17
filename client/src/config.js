// Konfigurasi API URL
// Logika: Prioritas ke URL Production (Render), jika string kosong/tidak ada maka fallback ke Localhost

const PRODUCTION_URL = 'https://be-user-dpd.onrender.com'; // Ganti dengan URL Production Anda
const LOCAL_URL = 'http://localhost:5000';

// Deteksi apakah sedang di Localhost (Development)
const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Jika di Localhost, pakai LOCAL_URL. Jika di Deploy (Render), pakai PRODUCTION_URL.
export const API_BASE_URL = isLocalDev ? LOCAL_URL : PRODUCTION_URL;
