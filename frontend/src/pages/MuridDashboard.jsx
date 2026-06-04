import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Search, BookOpen, ShieldAlert, Calendar, X, Phone } from 'lucide-react';
import api from '../services/api';
import { getCurrentUser } from '../services/auth';

export default function MuridDashboard() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [isSanksi, setIsSanksi] = useState(false);
  const [pesanSanksi, setPesanSanksi] = useState('');

  // Booking modal state
  const [bookingModal, setBookingModal] = useState(null);
  const [tanggalAmbil, setTanggalAmbil] = useState('');
  const [tanggalKembali, setTanggalKembali] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const user = getCurrentUser();

  useEffect(() => {
    if (!user) return;
    checkStatus();
    fetchBooks();
    fetchSettings();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await api.get('/users');
      const me = res.data.find(u => u._id === user._id);
      if (me && me.statusPeminjaman === 'disanksi') {
        setIsSanksi(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setSettings(data);
      if (data.pesanSanksi) setPesanSanksi(data.pesanSanksi);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/books');
      setBooks(res.data);
    } catch (err) {
      toast.error('Gagal mengambil data buku');
    }
    setLoading(false);
  };

  const openBookingModal = (book) => {
    const today = new Date().toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    setTanggalAmbil(today);
    setTanggalKembali(maxDate.toISOString().split('T')[0]);
    setBookingModal(book);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/transactions/book', {
        userId: user._id,
        bookId: bookingModal._id,
        tanggalAmbil,
        tanggalKembali
      });
      toast.success('Pemesanan berhasil! Silakan ambil di meja petugas.');
      setBookingModal(null);
      fetchBooks();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal booking';
      if (err.response?.data?.disanksi) {
        setIsSanksi(true);
        setBookingModal(null);
      }
      toast.error(msg);
    }
    setSubmitting(false);
  };

  if (!user) return <div className="text-center p-4">Silakan Login Terlebih Dahulu.</div>;

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* FLOATING MODAL SANKSI */}
      {isSanksi && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={32} className="text-rose-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Akun Disanksi</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              {pesanSanksi || 'Akun Anda sedang dalam sanksi. Silakan hubungi petugas perpustakaan untuk informasi lebih lanjut.'}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-indigo-600 bg-indigo-50 rounded-xl px-4 py-3">
              <Phone size={16} />
              <span className="font-medium">Hubungi Petugas Perpustakaan</span>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingModal && (
        <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setBookingModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Calendar size={16} className="text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-800 text-sm">Pilih Tanggal Peminjaman</h3>
              </div>
              <button onClick={() => setBookingModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBooking} className="p-5 space-y-4">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-400">Buku yang dipilih</p>
                <p className="font-semibold text-sm text-slate-800 mt-0.5">{bookingModal.title}</p>
                <p className="text-xs text-slate-400">{bookingModal.author || 'Penulis tidak diketahui'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Tanggal Ambil</label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={tanggalAmbil}
                    onChange={e => setTanggalAmbil(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Tanggal Kembali</label>
                  <input
                    type="date"
                    required
                    min={tanggalAmbil || todayStr}
                    className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={tanggalKembali}
                    onChange={e => setTanggalKembali(e.target.value)}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400">Durasi peminjaman maksimal 7 hari. Buku yang melewati batas waktu akan dikenakan denda.</p>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-2.5 rounded-xl text-sm font-medium hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : 'Konfirmasi Booking'}
                </button>
                <button type="button" onClick={() => setBookingModal(null)} className="bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header with search */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Katalog Buku</h2>
            <p className="text-sm text-slate-400 mt-0.5">Cari dan pesan buku yang tersedia</p>
          </div>
          {settings && (
            <div className="flex items-center gap-2 text-xs bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
              <Calendar size={14} className="text-indigo-500" />
              <span className="text-indigo-700">Buka: {settings.jamBuka} - {settings.jamTutup}</span>
            </div>
          )}
        </div>

        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul buku..."
            className="w-full border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-slate-50/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Books grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="skeleton h-52 w-full" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredBooks.map(book => (
            <div key={book._id} className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col">
              {/* Cover */}
              <div className="h-52 w-full bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden relative">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <BookOpen size={36} className="mb-2" />
                    <span className="text-xs">No Cover</span>
                  </div>
                )}
                {book.stock <= 0 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="text-white font-bold text-sm px-4 py-1.5 bg-rose-600/90 rounded-full">Habis</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 leading-snug">{book.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{book.author || 'Penulis Tidak Diketahui'}</p>

                <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${book.stock > 0 ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                    Stok: {book.stock}
                  </span>
                  <button
                    onClick={() => openBookingModal(book)}
                    disabled={book.stock <= 0}
                    className={`text-xs px-4 py-2 rounded-xl font-medium transition-all ${
                      book.stock > 0
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 shadow-sm'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Pesan
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredBooks.length === 0 && (
            <div className="col-span-full text-center py-16">
              <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm">Buku tidak ditemukan.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
