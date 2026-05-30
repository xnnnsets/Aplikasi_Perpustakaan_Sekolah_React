import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MuridDashboard() {
  const [books, setBooks] = useState([]);
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if(!user) return;
    fetchBooks();
    fetchHistory();
  }, []);

  const fetchBooks = async () => {
    const res = await axios.get('http://localhost:5000/api/books');
    setBooks(res.data);
  };

  const fetchHistory = async () => {
    const res = await axios.get(`http://localhost:5000/api/transactions/user/${user._id}`);
    setHistory(res.data);
  };

  const handleBooking = async (bookId) => {
    if(!window.confirm('Ingin Booking buku ini? (Ambil fisik di perpustakaan)')) return;
    try {
      await axios.post('http://localhost:5000/api/transactions/book', {
        userId: user._id,
        bookId
      });
      alert('Booking berhasil!');
      fetchBooks();
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal booking');
    }
  };

  if(!user) return <div className="text-center">Silakan Login Terlebih Dahulu.</div>;

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      
      {/* Kolom Kiri: Cari Buku */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Cari Buku (Jalur A - Web Booking)</h2>
        <input 
          type="text" 
          placeholder="Cari judul buku..." 
          className="w-full border p-2 mb-4 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredBooks.map(book => (
            <div key={book._id} className="border p-4 rounded flex justify-between items-center">
              <div>
                <p className="font-semibold">{book.title}</p>
                <p className="text-sm text-gray-500">{book.author} | Stok: {book.stock}</p>
              </div>
              <button 
                onClick={() => handleBooking(book._id)}
                disabled={book.stock <= 0}
                className={`px-4 py-2 rounded text-white ${book.stock > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                {book.stock > 0 ? 'Booking' : 'Habis'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Kolom Kanan: Status & Riwayat */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Profil & Status</h2>
        <p>Nama: <strong>{user.name}</strong> (NIS: {user.nis})</p>
        <p>Denda Aktif: <strong className="text-red-500">Rp {user.dendaAktif || 0}</strong></p>
        
        <h3 className="mt-6 font-bold border-b pb-2 mb-2">Riwayat Transaksi & Pinjaman</h3>
        <div className="space-y-3">
          {history.length === 0 ? <p className="text-gray-500 text-sm">Belum ada riwayat</p> : null}
          {history.map(trx => (
            <div key={trx._id} className="border-l-4 border-blue-500 pl-3 py-1">
              <p className="font-semibold">{trx.book?.title}</p>
              <p className="text-xs text-gray-500">Status: <span className="uppercase font-bold">{trx.status}</span> | Jalur: {trx.jalur}</p>
              {trx.tanggalJatuhTempo && <p className="text-xs">Jatuh Tempo: {new Date(trx.tanggalJatuhTempo).toLocaleDateString()}</p>}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
