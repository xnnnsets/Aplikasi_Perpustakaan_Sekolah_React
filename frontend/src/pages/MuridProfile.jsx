import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User, BookOpen, CreditCard, Shield, Clock } from 'lucide-react';
import api from '../services/api';

export default function MuridProfile() {
  const [history, setHistory] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const [loading, setLoading] = useState(true);

  const localUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!localUser) return;
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      setUserProfile(localUser);
      const res = await api.get(`/transactions/user/${localUser._id}`);
      setHistory(res.data);
    } catch (err) {
      toast.error('Gagal mengambil data profil');
    }
    setLoading(false);
  };

  const statusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
      case 'dipinjam': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
      case 'kembali': return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-white border border-white/30">
              {(userProfile.name || 'M').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{userProfile.name}</h2>
              <p className="text-emerald-100/80 text-sm">Siswa</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <ProfileInfoItem icon={<User size={16} />} label="NIS" value={userProfile.nis} />
          <ProfileInfoItem icon={<Shield size={16} />} label="Role" value={userProfile.role} capitalize />
          <ProfileInfoItem
            icon={<CreditCard size={16} />}
            label="Total Denda"
            value={`Rp ${userProfile.dendaAktif || 0}`}
            danger={userProfile.dendaAktif > 0}
            hint={userProfile.dendaAktif > 0 ? 'Hubungi petugas untuk pelunasan' : null}
          />
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <Clock size={16} className="text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Riwayat Peminjaman</h3>
            <p className="text-[11px] text-slate-400">{history.length} transaksi</p>
          </div>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Buku</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Jalur</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Tgl Pinjam</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Tgl Kembali</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Denda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map(h => (
                  <tr key={h._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-700">{h.book?.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase">{h.jalur?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle(h.status)}`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{h.tanggalPinjam ? new Date(h.tanggalPinjam).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{h.tanggalKembali ? new Date(h.tanggalKembali).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="px-5 py-3 text-right">
                      {h.denda > 0 ? (
                        <span className="text-rose-600 font-semibold text-xs">Rp {h.denda.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center">
                      <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-sm text-slate-400">Belum ada riwayat peminjaman.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileInfoItem({ icon, label, value, capitalize, danger, hint }) {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center gap-2 text-slate-400 mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={`font-semibold text-lg ${danger ? 'text-rose-600' : 'text-slate-800'} ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </p>
      {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
    </div>
  );
}
