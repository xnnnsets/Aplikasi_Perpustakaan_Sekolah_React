import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Upload, X, BookOpen, Image } from 'lucide-react';
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
      let finalCoverImage = formData.coverImage;
      const gdriveMatch = finalCoverImage?.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (gdriveMatch) {
        finalCoverImage = `https://lh3.googleusercontent.com/d/${gdriveMatch[1]}`;
      }

      const payload = { ...formData, coverImage: finalCoverImage };

      if (editId) {
        await api.put(`/books/${editId}`, payload);
        toast.success('Buku berhasil diubah!');
      } else {
        await api.post('/books', payload);
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

  const cancelEdit = () => {
    setEditId(null);
    setFormData({ title: '', author: '', stock: '', coverImage: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Kelola Data Buku</h2>
          <p className="text-sm text-slate-400 mt-0.5">{books.length} buku terdaftar</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            {editId ? <Pencil size={16} className="text-indigo-600" /> : <Plus size={16} className="text-indigo-600" />}
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">{editId ? 'Edit Buku' : 'Tambah Buku Baru'}</h3>
          {editId && (
            <button onClick={cancelEdit} className="ml-auto text-slate-400 hover:text-slate-600 transition-colors">
              <X size={18} />
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Judul Buku</label>
              <input required type="text" className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Masukkan judul buku" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Penulis</label>
              <input type="text" className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} placeholder="Nama penulis" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Stok</label>
              <input required type="number" min="1" className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} placeholder="1" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Link Gambar (Gdrive/URL)</label>
              <div className="relative">
                <Image size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="https://..." className="w-full border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" value={formData.coverImage} onChange={e => setFormData({ ...formData, coverImage: e.target.value })} />
              </div>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Atau Upload Lokal</label>
              <label className={`flex items-center gap-2 border border-dashed border-slate-300 rounded-xl px-3 py-2 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                <Upload size={16} className="text-slate-400" />
                <span className="text-sm text-slate-500">{uploading ? 'Uploading...' : 'Pilih file gambar'}</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-sm">
              {editId ? 'Simpan Perubahan' : 'Tambah Buku'}
            </button>
            {editId && (
              <button type="button" onClick={cancelEdit} className="bg-slate-100 text-slate-600 px-5 py-2 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <BookOpen size={16} className="text-slate-600" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Daftar Buku</h3>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-14 w-full" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider w-16">Cover</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Judul</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Penulis</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Stok</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {books.map(b => (
                  <tr key={b._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-3">
                      {b.coverImage ? (
                        <img src={b.coverImage} alt="Cover" referrerPolicy="no-referrer" className="w-10 h-14 object-cover rounded-lg shadow-sm" />
                      ) : (
                        <div className="w-10 h-14 bg-slate-100 flex items-center justify-center rounded-lg">
                          <BookOpen size={14} className="text-slate-300" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-700">{b.title}</td>
                    <td className="px-5 py-3 text-slate-500">{b.author || '-'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${b.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {b.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(b)} className="p-2 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(b._id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors" title="Hapus">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {books.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-5 py-12 text-center text-slate-400 text-sm">Belum ada buku terdaftar.</td>
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
