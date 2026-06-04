import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Users, UserPlus, ShieldAlert, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ nis: '', name: '', password: '', limitPeminjaman: '' });
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
        await api.put(`/users/${editId}`, formData);
        toast.success('Murid berhasil diubah!');
      } else {
        await api.post('/users', formData);
        toast.success('Murid berhasil ditambahkan!');
      }
      setFormData({ nis: '', name: '', password: '', limitPeminjaman: '' });
      setEditId(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'NIS kemungkinan sudah dipakai!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus murid ini?')) return;
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
    setFormData({ nis: user.nis, name: user.name, password: user.password, limitPeminjaman: user.limitPeminjaman ?? '' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setFormData({ nis: '', name: '', password: '', limitPeminjaman: '' });
  };

  const handleToggleSanksi = async (user) => {
    const action = user.statusPeminjaman === 'aktif' ? 'memberi sanksi' : 'mencabut sanksi';
    if (!window.confirm(`Yakin ingin ${action} murid ${user.name}?`)) return;
    try {
      const res = await api.put(`/users/${user._id}/toggle-sanksi`);
      toast.success(res.data.message);
      fetchUsers();
    } catch (err) {
      toast.error('Gagal mengubah status.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Kelola Data Murid</h2>
        <p className="text-sm text-slate-400 mt-0.5">{users.length} murid terdaftar</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            {editId ? <Pencil size={16} className="text-indigo-600" /> : <UserPlus size={16} className="text-indigo-600" />}
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">{editId ? 'Edit Murid' : 'Tambah Murid Baru'}</h3>
          {editId && (
            <button onClick={cancelEdit} className="ml-auto text-slate-400 hover:text-slate-600 transition-colors">
              <X size={18} />
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">NIS</label>
              <input required type="text" className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" value={formData.nis} onChange={e => setFormData({ ...formData, nis: e.target.value })} disabled={!!editId} placeholder="Nomor Induk Siswa" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Nama Lengkap</label>
              <input required type="text" className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Nama lengkap murid" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Password</label>
              <input required type="text" className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Password akun" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Batas Pinjaman Khusus</label>
              <input
                type="number"
                min="0"
                className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                value={formData.limitPeminjaman}
                onChange={e => setFormData({ ...formData, limitPeminjaman: e.target.value })}
                placeholder="Kosongkan ikut global"
              />
              <p className="text-[11px] text-slate-400 mt-1">Isi 0 untuk tanpa limit khusus, atau kosongkan agar ikut global.</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-sm">
              {editId ? 'Simpan Perubahan' : 'Tambah Murid'}
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
            <Users size={16} className="text-slate-600" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Daftar Murid</h3>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">NIS</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Nama</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Limit</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Password</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Denda</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-600">{u.nis}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${u.statusPeminjaman === 'disanksi' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-700">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${u.limitPeminjaman === null || u.limitPeminjaman === undefined ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-600'}`}>
                        {u.limitPeminjaman === null || u.limitPeminjaman === undefined ? 'Ikut Global' : `${u.limitPeminjaman} buku`}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{u.password}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.statusPeminjaman === 'disanksi'
                          ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                          : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      }`}>
                        {u.statusPeminjaman === 'disanksi' ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                        {u.statusPeminjaman === 'disanksi' ? 'Disanksi' : 'Aktif'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${u.dendaAktif > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        Rp {u.dendaAktif || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleSanksi(u)}
                          className={`p-2 rounded-lg transition-colors ${
                            u.statusPeminjaman === 'disanksi'
                              ? 'hover:bg-emerald-50 text-emerald-500'
                              : 'hover:bg-rose-50 text-rose-400'
                          }`}
                          title={u.statusPeminjaman === 'disanksi' ? 'Cabut Sanksi' : 'Beri Sanksi'}
                        >
                          {u.statusPeminjaman === 'disanksi' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                        </button>
                        <button onClick={() => handleEdit(u)} className="p-2 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(u._id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors" title="Hapus">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center text-slate-400 text-sm">Belum ada murid terdaftar.</td>
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
