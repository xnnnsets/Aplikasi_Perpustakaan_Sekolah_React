import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Clock, RotateCcw, CheckCircle2, BookCopy, Settings, ArrowRightLeft, X } from 'lucide-react';
import api from '../services/api';
import { getCurrentUser } from '../services/auth';

export default function AdminDashboard() {
  const [pendings, setPendings] = useState([]);
  const [rejecteds, setRejecteds] = useState([]);
  const [actives, setActives] = useState([]);
  const [books, setBooks] = useState([]);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');

  const userData = getCurrentUser() || {};
  const currentAdminNis = userData.nis || 'admin';
  const [newNis, setNewNis] = useState(currentAdminNis);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchPendings();
    fetchRejecteds();
    fetchActives();
    fetchBooks();
  }, []);

  const fetchPendings = async () => {
    try {
      const res = await api.get('/transactions/pending');
      setPendings(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchRejecteds = async () => {
    try {
      const res = await api.get('/transactions/rejected');
      setRejecteds(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchActives = async () => {
    try {
      const res = await api.get('/transactions/active');
      setActives(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchBooks = async () => {
    try {
      const res = await api.get('/books');
      setBooks(res.data);
    } catch (err) { console.error(err); }
  };

  const handleApproveBooking = async (id) => {
    try {
      await api.post('/transactions/approve-booking', { transactionId: id });
      toast.success('Booking disetujui, buku diberikan ke murid.');
      fetchPendings();
      fetchRejecteds();
      fetchActives();
      fetchBooks();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleOpenReject = (transaction) => {
    setRejectModal(transaction);
    setRejectReason('');
  };

  const handleRejectBooking = async (e) => {
    e.preventDefault();
    if (!rejectModal) return;
    try {
      await api.post('/transactions/reject-booking', {
        transactionId: rejectModal._id,
        alasanDitolak: rejectReason
      });
      toast.success('Booking ditolak dan catatan disimpan.');
      setRejectModal(null);
      setRejectReason('');
      fetchPendings();
      fetchRejecteds();
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleReturn = async (id) => {
    if (!window.confirm('Verifikasi fisik buku bagus? Konfirmasi pengembalian.')) return;
    try {
      const res = await api.post('/transactions/return', { transactionId: id });
      toast.success(res.data.message);
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
        sessionStorage.removeItem('user');
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {rejectModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setRejectModal(null)}>
          <form onSubmit={handleRejectBooking} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Tolak Booking Web</h3>
                <p className="text-[11px] text-slate-400">Masukkan alasan penolakan untuk murid</p>
              </div>
              <button type="button" onClick={() => setRejectModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-400">Murid</p>
                <p className="font-semibold text-sm text-slate-800">{rejectModal.user?.name}</p>
                <p className="text-xs text-slate-400">{rejectModal.book?.title}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Alasan Tidak Disetujui</label>
                <textarea
                  rows={4}
                  required
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
                  placeholder="Contoh: Buku sedang tidak tersedia, kuota pinjaman penuh, atau alasan lain..."
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex gap-2 justify-end">
              <button type="button" onClick={() => setRejectModal(null)} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Batal</button>
              <button type="submit" className="bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-700 transition-colors">Tolak Booking</button>
            </div>
          </form>
        </div>
      )}

      {/* Stats overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Clock size={20} />} label="Booking Pending" value={pendings.length} color="amber" />
        <StatCard icon={<BookCopy size={20} />} label="Buku Tersedia" value={books.reduce((total, book) => total + (book.stock || 0), 0)} color="blue" />
        <StatCard icon={<ArrowRightLeft size={20} />} label="Sedang Dipinjam" value={actives.length} color="indigo" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Booking Ditolak" value={rejecteds.length} color="emerald" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-3 flex flex-wrap gap-2">
        {[
          { key: 'semua', label: 'Semua', count: pendings.length + rejecteds.length + actives.length },
          { key: 'pending', label: 'Pending', count: pendings.length },
          { key: 'ditolak', label: 'Ditolak', count: rejecteds.length },
          { key: 'dipinjam', label: 'Aktif', count: actives.length },
        ].map(item => {
          const active = statusFilter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setStatusFilter(item.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${active ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {item.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-white/15' : 'bg-white text-slate-500'}`}>{item.count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(statusFilter === 'semua' || statusFilter === 'pending') && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock size={16} className="text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 text-sm">Konfirmasi Booking Web</h2>
              <p className="text-[11px] text-slate-400">Setujui booking dari murid yang memesan via web</p>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-[350px] overflow-y-auto">
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
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleOpenReject(t)} className="bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-rose-600 transition-colors">
                    Tolak
                  </button>
                  <button onClick={() => handleApproveBooking(t._id)} className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors">
                    Setujui
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {(statusFilter === 'semua' || statusFilter === 'ditolak') && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <X size={16} className="text-rose-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 text-sm">Booking Ditolak</h2>
              <p className="text-[11px] text-slate-400">Daftar booking yang sudah ditolak beserta alasannya</p>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-[350px] overflow-y-auto">
            {rejecteds.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">Belum ada booking yang ditolak</p>
              </div>
            ) : rejecteds.map(t => (
              <div key={t._id} className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">{t.user?.name}</p>
                    <p className="text-xs text-slate-400">NIS: {t.user?.nis} &middot; {t.book?.title}</p>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-md bg-rose-100 text-rose-700">Ditolak</span>
                </div>
                <p className="mt-2 text-xs text-rose-700 bg-white/70 border border-rose-100 rounded-lg px-3 py-2">
                  {t.alasanDitolak || 'Tidak ada alasan tertulis'}
                </p>
              </div>
            ))}
          </div>
        </div>
        )}

        {(statusFilter === 'semua' || statusFilter === 'dipinjam') && (
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
        )}

        {/* PANEL 3: PENGATURAN AKUN */}
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
