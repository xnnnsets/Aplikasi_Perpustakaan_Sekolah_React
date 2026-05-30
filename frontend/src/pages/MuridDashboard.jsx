import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Search, BookOpen, ShoppingBag } from 'lucide-react';
import api from '../services/api';

export default function MuridDashboard() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) return;
    fetchBooks();
  }, []);

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

  const handleBooking = async (bookId) => {
    if (!window.confirm('Ingin Booking buku ini? (Ambil fisik maksimal hari ini)')) return;
    try {
      await api.post('/transactions/book', { userId: user._id, bookId });
      toast.success('Pemesanan buku berhasil, silakan ambil di meja petugas');
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal booking');
    }
  };

  if (!user) return <div className="text-center p-4">Silakan Login Terlebih Dahulu.</div>;

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with search */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Katalog Buku</h2>
            <p className="text-sm text-slate-400 mt-0.5">Cari dan pesan buku yang tersedia</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <ShoppingBag size={14} className="text-amber-500" />
            <span className="text-amber-700">Wajib ambil fisik hari ini</span>
          </div>
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
                    onClick={() => handleBooking(book._id)}
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
