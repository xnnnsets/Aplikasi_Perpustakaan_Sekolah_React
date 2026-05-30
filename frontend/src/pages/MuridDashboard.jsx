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
        <h2 className="text-xl font-bold mb-2">Cari & Pesan Buku (Jalur A)</h2>
        <p className="text-gray-600 mb-4 text-sm">Gunakan fitur ini untuk memesan buku. Anda wajib mengambil fisiknya hari ini di perpustakaan agar reservasi tidak hangus.</p>
        
        <input 
          type="text" 
          placeholder="Cari berdasarkan judul buku..." 
          className="w-full border p-3 mb-6 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        {loading ? <p>Mencari katalog buku...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map(book => (
              <div key={book._id} className="border p-4 rounded bg-gray-50 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-gray-800">{book.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{book.author || 'Penulis Tidak Diketahui'}</p>
                  <p className="text-xs font-semibold mt-2 text-blue-600">Stok Tersedia: {book.stock}</p>
                </div>
                <button 
                  onClick={() => handleBooking(book._id)}
                  disabled={book.stock <= 0}
                  className={`w-full py-2 rounded text-white font-semibold transition-colors ${
                    book.stock > 0 ? 'bg-green-600 hover:bg-green-700 shadow' : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {book.stock > 0 ? 'Pesan Buku' : 'Stok Habis'}
                </button>
              </div>
            ))}
            {filteredBooks.length === 0 && <p className="text-gray-500 col-span-full">Buku tidak ditemukan.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
