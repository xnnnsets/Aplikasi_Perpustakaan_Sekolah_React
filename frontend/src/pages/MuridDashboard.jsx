import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function MuridDashboard() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if(!user) return;
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/books');
      setBooks(res.data);
    } catch(err) {
      toast.error('Gagal mengambil data buku');
    }
    setLoading(false);
  };

  const handleBooking = async (bookId) => {
    if(!window.confirm('Ingin Booking buku ini? (Ambil fisik maksimal hari ini)')) return;
    try {
      await api.post('/transactions/book', {
        userId: user._id,
        bookId
      });
      toast.success('Pemesanan buku berhasil, silakan ambil di meja petugas');
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal booking');
    }
  };

  if(!user) return <div className="text-center p-4">Silakan Login Terlebih Dahulu.</div>;

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded shadow border-t-4 border-green-600">
        <h2 className="text-xl font-bold mb-2">Katalog & Pesan Buku</h2>
        <p className="text-gray-600 mb-6 text-sm">Gunakan fitur ini untuk memesan buku. Anda wajib mengambil fisiknya hari ini di perpustakaan agar reservasi tidak hangus.</p>
        
        <input 
          type="text" 
          placeholder="Cari berdasarkan judul buku..."
          className="w-full border p-3 mb-6 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        {loading ? <p>Mencari katalog buku...</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBooks.map(book => (
              <div key={book._id} className="border rounded-lg bg-white overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="h-48 w-full bg-gray-200 overflow-hidden relative">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-xs">No Cover</span>
                    </div>
                  )}
                  {book.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold px-3 py-1 bg-red-600 rounded">HABIS</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-md text-gray-800 line-clamp-2">{book.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{book.author || 'Penulis Tidak Diketahui'}</p>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">Stok: {book.stock}</span>
                    <button 
                      onClick={() => handleBooking(book._id)}
                      disabled={book.stock <= 0}
                      className={`text-sm px-4 py-2 rounded text-white font-semibold transition-colors ${
                        book.stock > 0 ? 'bg-green-600 hover:bg-green-700 shadow' : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Pesan
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredBooks.length === 0 && <p className="text-gray-500 col-span-full text-center py-8">Buku tidak ditemukan.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
