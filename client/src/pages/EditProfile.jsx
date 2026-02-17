import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function EditProfile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user_data') || '{}'));
    const [nama, setNama] = useState(user.nama || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama })
            });
            const data = await res.json();
            if (data.status === 'success') {
                // Update localStorage
                const newUser = { ...user, nama };
                localStorage.setItem('user_data', JSON.stringify(newUser));
                alert('Profil berhasil diperbarui!');
                navigate('/profile');
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Gagal memperbarui profil');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="bg-white p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20}/></button>
                <h1 className="font-bold text-lg text-slate-800">Edit Profil</h1>
            </div>
            <div className="p-6">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="flex justify-center mb-6">
                         <div className="w-24 h-24 bg-slate-200 rounded-full overflow-hidden border-4 border-white shadow-md">
                            <img src={`https://ui-avatars.com/api/?name=${nama.replace(' ', '+')}&background=ef4444&color=fff`} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">NIP (Tidak dapat diubah)</label>
                        <input type="text" value={user.nip} disabled className="w-full bg-slate-200 border border-slate-300 rounded-xl p-4 text-slate-500 font-mono cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nama Lengkap</label>
                        <div className="relative">
                            <User className="absolute left-4 top-4 text-slate-400" size={20} />
                            <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Nama Lengkap" />
                        </div>
                    </div>
                    <button disabled={loading} className="w-full bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-2">
                        {loading ? 'Menyimpan...' : <><Save size={20} /> Simpan Perubahan</>}
                    </button>
                </form>
            </div>
        </div>
    );
}