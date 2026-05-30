import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ nis: '', name: '', password: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      toast.error('Gagal mengambil data murid');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // jika kosong, jangan kirim password agar di backend logikanya bisa di-handle (opsional)
        // Di sini kita timpa.
        await api.put(`/users/${editId}`, formData);
        toast.success('Murid berhasil diubah!');
      } else {
        await api.post('/users', formData);
        toast.success('Murid berhasil ditambahkan!');
      }
      setFormData({ nis: '', name: '', password: '' });
      setEditId(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'NIS kemungkinan sudah dipakai!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus murid ini? (Seluruh relasinya juga mungkin akan terdampak)')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Murid berhasil dihapus!');
      fetchUsers();
    } catch (err) {
      toast.error('Gagal menghapus murid');
    }
  };

  const handleEdit = (user) => {
    setEditId(user._id);
    setFormData({ nis: user.nis, name: user.name, password: user.password });
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Kelola Data Murid</h2>

      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 p-4 rounded border">
        <div>
          <label className="block text-sm mb-1">NIS</label>
          <input required type="text" className="w-full border p-2 rounded" value={formData.nis} onChange={e => setFormData({...formData, nis: e.target.value})} disabled={!!editId} />
        </div>
        <div>
          <label className="block text-sm mb-1">Nama Lengkap</label>
          <input required type="text" className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input required type="text" className="w-full border p-2 rounded" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">{editId ? 'Simpan Ubahan' : 'Tambah Murid'}</button>
          {editId && <button type="button" onClick={() => {setEditId(null); setFormData({nis:'', name:'', password:''})}} className="bg-gray-400 text-white px-4 py-2 rounded shadow hover:bg-gray-500">Batal</button>}
        </div>
      </form>

      {loading ? <p>Loading data...</p> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left bg-white border">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3">NIS</th>
                <th className="p-3">Nama</th>
                <th className="p-3">Password</th>
                <th className="p-3 text-red-600">Denda Aktif</th>
                <th className="p-3 w-40">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono">{u.nis}</td>
                  <td className="p-3 font-semibold">{u.name}</td>
                  <td className="p-3 text-sm text-gray-500">{u.password}</td>
                  <td className="p-3 text-red-500 font-bold">Rp {u.dendaAktif || 0}</td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => handleEdit(u)} className="text-sm bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500">Edit</button>
                    <button onClick={() => handleDelete(u._id)} className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Hapus</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="5" className="p-3 text-center text-gray-500">Tidak ada data murid.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
