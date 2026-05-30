import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Clock, ArrowRightLeft, RotateCcw, Wallet, Settings, CheckCircle2, UserSearch, BookCopy } from 'lucide-react';
import api from '../services/api';

export default function AdminDashboard() {
  const [pendings, setPendings] = useState([]);
  const [actives, setActives] = useState([]);

  const [walkinNis, setWalkinNis] = useState('');
  const [walkinBookId, setWalkinBookId] = useState('');

  const [fineNis, setFineNis] = useState('');
  const [fineAmount, setFineAmount] = useState('');

  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const currentAdminNis = userData.nis || 'admin';
  const [newNis, setNewNis] = useState(currentAdminNis);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchPendings();
    fetchActives();
  }, []);

  const fetchPendings = async () => {
    try {
      const res = await api.get('/transactions/pending');
      setPendings(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchActives = async () => {
    try {
      const res = await api.get('/transactions/active');
      setActives(res.data);
    } catch (err) { console.error(err); }
  };

  const handleApproveBooking = async (id) => {
    try {
      await api.post('/transactions/approve-booking', { transactionId: id });
      toast.success('Booking disetujui, buku diberikan ke murid.');
      fetchPendings();
      fetchActives();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleWalkIn = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions/walk-in', { nis: walkinNis, titleOrId: walkinBookId });
      toast.success('Sirkulasi Walk-In Berhasil!');
      fetchActives();
      setWalkinNis(''); setWalkinBookId('');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleReturn = async (id) => {
    if (!window.confirm('Verifikasi fisik buku bagus? Konfirmasi pengembalian.')) return;
    try {
      const res = await api.post('/transactions/return', { transactionId: id });
      toast.success(res.data.message);
      fetchActives();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handlePayFine = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/pay-fine', { nis: fineNis, amount: Number(fineAmount) });
      toast.success(`Denda dilunasi. Sisa Denda: Rp${res.data.user.dendaAktif}`);
      setFineNis(''); setFineAmount('');
      fetchActives();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/admin/update-profile', {
        currentNis: currentAdminNis,
        newNis: newNis,
        newPassword: newPassword
      });
      toast.success(res.data.message);
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Clock size={20} />} label="Booking Pending" value={pendings.length} color="amber" />
        <StatCard icon={<BookCopy size={20} />} label="Sedang Dipinjam" value={actives.length} color="blue" />
        <StatCard icon={<ArrowRightLeft size={20} />} label="Total Aktif" value={pendings.length + actives.length} color="indigo" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Perlu Aksi" value={pendings.length} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANEL 1: PENDING BOOKINGS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock size={16} className="text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 text-sm">Konfirmasi Booking</h2>
              <p className="text-[11px] text-slate-400">Jalur A: Pemesanan via Web</p>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
            {pendings.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">Tidak ada booking pending</p>
              </div>
            ) : pendings.map(t => (
              <div key={t._id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-colors">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-slate-800 truncate">{t.user?.name}</p>
                  <p className="text-xs text-slate-400">NIS: {t.user?.nis} &middot; {t.book?.title}</p>
                </div>
                <button onClick={() => handleApproveBooking(t._id)} className="shrink-0 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors">
                  Setujui
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL 2: WALK-IN */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <ArrowRightLeft size={16} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 text-sm">Peminjaman Walk-In</h2>
              <p className="text-[11px] text-slate-400">Jalur B: Langsung di perpustakaan</p>
            </div>
          </div>
          <form onSubmit={handleWalkIn} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Scan NIS Murid</label>
              <div className="relative">
                <UserSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" className="w-full border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" value={walkinNis} onChange={e => setWalkinNis(e.target.value)} required placeholder="Contoh: 1001" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Scan ID / Judul Buku</label>
              <div className="relative">
                <BookCopy size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" className="w-full border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" value={walkinBookId} onChange={e => setWalkinBookId(e.target.value)} required placeholder="Judul atau ID buku" />
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-2.5 rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-sm">
              Pinjamkan Buku
            </button>
          </form>
        </div>

        {/* PANEL 3: PENGEMBALIAN */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <RotateCcw size={16} className="text-rose-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 text-sm">Pengembalian Buku</h2>
              <p className="text-[11px] text-slate-400">{actives.length} buku sedang dipinjam</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Murid</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Buku</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Jatuh Tempo</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Jalur</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {actives.map(t => (
                  <tr key={t._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-700">{t.user?.name}</td>
                    <td className="px-5 py-3 text-slate-600">{t.book?.title}</td>
                    <td className="px-5 py-3">
                      <span className="text-rose-600 font-medium text-xs bg-rose-50 px-2 py-1 rounded-md">
                        {t.tanggalJatuhTempo ? new Date(t.tanggalJatuhTempo).toLocaleDateString('id-ID') : '-'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase">{t.jalur?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => handleReturn(t._id)} className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors">
                        Terima Kembali
                      </button>
                    </td>
                  </tr>
                ))}
                {actives.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-5 py-12 text-center text-slate-400 text-sm">Tidak ada buku yang sedang dipinjam.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PANEL 4: PEMBAYARAN DENDA */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Wallet size={16} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 text-sm">Pembayaran Denda</h2>
              <p className="text-[11px] text-slate-400">Kasir: Lunasi denda murid</p>
            </div>
          </div>
          <form onSubmit={handlePayFine} className="p-5 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">NIS Murid</label>
              <input type="text" className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" value={fineNis} onChange={e => setFineNis(e.target.value)} required placeholder="Masukkan NIS" />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Nominal Bayar (Rp)</label>
              <input type="number" className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" value={fineAmount} onChange={e => setFineAmount(e.target.value)} required placeholder="0" />
            </div>
            <button className="shrink-0 bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm w-full md:w-auto">
              Bayar Lunas
            </button>
          </form>
        </div>

        {/* PANEL 5: PENGATURAN AKUN */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <Settings size={16} className="text-violet-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 text-sm">Pengaturan Akun Admin</h2>
              <p className="text-[11px] text-slate-400">Ubah username atau password</p>
            </div>
          </div>
          <form onSubmit={handleUpdateProfile} className="p-5 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Username / NIS Admin</label>
              <input type="text" className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" value={newNis} onChange={e => setNewNis(e.target.value)} required />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Password Baru</label>
              <input type="password" placeholder="Kosongkan jika tidak diubah" className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <button type="submit" className="shrink-0 bg-violet-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors shadow-sm w-full md:w-auto">
              Simpan & Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          <p className="text-xs text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  );
}
