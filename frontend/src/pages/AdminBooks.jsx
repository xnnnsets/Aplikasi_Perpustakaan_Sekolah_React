import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', author: '', stock: '', coverImage: '' });
  const [editId, setEditId] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/books');
      setBooks(data);
    } catch (err) {
      toast.error('Gagal mengambil data buku');
    }
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);
      const res = await api.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, coverImage: import.meta.env.VITE_API_URL.replace('/api', '') + res.data.url });
      toast.success('Gambar berhasil diunggah!');
    } catch (err) {
      toast.error('Gagal upload gambar');
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/books/${editId}`, formData);
        toast.success('Buku berhasil diubah!');
      } else {
        await api.post('/books', formData);
        toast.success('Buku berhasil ditambahkan!');
      }
      setFormData({ title: '', author: '', stock: '', coverImage: '' });
      setEditId(null);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan sistem');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus buku ini?')) return;
    try {
      await api.delete(`/books/${id}`);
      toast.success('Buku berhasil dihapus!');
      fetchBooks();
    } catch (err) {
      toast.error('Gagal menghapus buku');
    }
  };

  const handleEdit = (book) => {
    setEditId(book._id);
    setFormData({ title: book.title, author: book.author || '', stock: book.stock, coverImage: book.coverImage || '' });
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Kelola Data Buku</h2>

      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end bg-gray-50 p-4 rounded border">
        <div className="lg:col-span-2">
          <label className="block text-sm mb-1">Judul Buku</label>
          <input required type="text" className="w-full border p-2 rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm mb-1">Penulis</label>
          <input type="text" className="w-full border p-2 rounded" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm mb-1">Stok</label>
          <input required type="number" min="1" className="w-full border p-2 rounded" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
        </div>
        
        <div className="lg:col-span-3">
          <label className="block text-sm mb-1">Link Gambar (Gdrive/URL)</label>
          <input type="text" placeholder="https://..." className="w-full border p-2 rounded" value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} />
        </div>
        <div className="lg:col-span-2">
          <label className="block text-sm mb-1">Atau Upload Gambar Lokal</label>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full border p-[5px] rounded bg-white" disabled={uploading} />
          {uploading && <span className="text-xs text-blue-500">Uploading...</span>}
        </div>

        <div className="flex gap-2 lg:col-span-5 mt-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">{editId ? 'Simpan Ubahan' : 'Tambah Buku'}</button>
          {editId && <button type="button" onClick={() => {setEditId(null); setFormData({title:'', author:'', stock:'', coverImage:''})}} className="bg-gray-400 text-white px-4 py-2 rounded shadow hover:bg-gray-500">Batal</button>}
        </div>
      </form>

      {loading ? <p>Loading data...</p> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left bg-white border">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3 w-16">Cover</th>
                <th className="p-3">Judul</th>
                <th className="p-3">Penulis</th>
                <th className="p-3">Stok</th>
                <th className="p-3 w-40">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {books.map(b => (
                <tr key={b._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    {b.coverImage ? (
                      <img src={b.coverImage} alt="Cover" className="w-12 h-16 object-cover rounded shadow shadow-sm" />
                    ) : (
                      <div className="w-12 h-16 bg-gray-200 flex items-center justify-center rounded shadow-sm text-xs text-gray-400">No Img</div>
                    )}
                  </td>
                  <td className="p-3 font-semibold">{b.title}</td>
                  <td className="p-3">{b.author || '-'}</td>
                  <td className="p-3">{b.stock}</td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => handleEdit(b)} className="text-sm bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500">Edit</button>
                    <button onClick={() => handleDelete(b._id)} className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Hapus</button>
                  </td>
                </tr>
              ))}
              {books.length === 0 && <tr><td colSpan="5" className="p-3 text-center text-gray-500">Tidak ada buku.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
