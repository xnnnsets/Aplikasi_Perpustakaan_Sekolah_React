import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function AdminDashboard() {
  const [pendings, setPendings] = useState([]);
  const [actives, setActives] = useState([]);
  
  // States for Walk-in
  const [walkinNis, setWalkinNis] = useState('');
  const [walkinBookId, setWalkinBookId] = useState('');

  // States for Fines
  const [fineNis, setFineNis] = useState('');
  const [fineAmount, setFineAmount] = useState('');

  // States for Admin Profile Update
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const currentAdminNis = userData.nis || 'admin';
  const [newNis, setNewNis] = useState(currentAdminNis);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchPendings();
    fetchActives();
  }, []);

  const fetchPendings = async () => {
    try {
      const res = await api.get('/transactions/pending');
      setPendings(res.data);
    } catch(err) { console.error(err); }
  };

  const fetchActives = async () => {
    try {
      const res = await api.get('/transactions/active');
      setActives(res.data);
    } catch(err) { console.error(err); }
  };

  const handleApproveBooking = async (id) => {
    try {
      await api.post('/transactions/approve-booking', { transactionId: id });
      toast.success('Booking disetujui, buku diberikan ke murid.');
      fetchPendings();
      fetchActives();
    } catch(err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleWalkIn = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions/walk-in', {
        nis: walkinNis,
        titleOrId: walkinBookId
      });
      toast.success('Sirkulasi Walk-In Berhasil!');
      fetchActives();
      setWalkinNis(''); setWalkinBookId('');
    } catch(err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleReturn = async (id) => {
    if(!window.confirm('Verifikasi fisik buku bagus? Konfirmasi pengembalian.')) return;
    try {
      const res = await api.post('/transactions/return', { transactionId: id });
      toast.success(res.data.message);
      fetchActives();
    } catch(err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handlePayFine = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/pay-fine', {
        nis: fineNis, amount: Number(fineAmount)
      });
      toast.success(`Denda dilunasi. Sisa Denda: Rp${res.data.user.dendaAktif}`);
      setFineNis(''); setFineAmount('');
      fetchActives(); // refresh just in case
    } catch(err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  // Logika untuk Update Profile Admin
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/admin/update-profile', {
        currentNis: currentAdminNis,
        newNis: newNis,
        newPassword: newPassword
      });
      
      toast.success(res.data.message);
      
      // Logout otomatis setelah berhasil
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/';
      }, 2000);
    } catch(err) { 
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil.'); 
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PANEL 1: PENDING BOOKINGS (Jalur A) */}
        <div className="bg-white p-6 rounded shadow border-t-4 border-yellow-500">
          <h2 className="font-bold text-lg mb-4">JALUR A: Konfirmasi Booking (Web)</h2>
          {pendings.length === 0 ? <p className="text-gray-500">Tidak ada booking ter-pending.</p> : null}
          <div className="space-y-3">
            {pendings.map(t => (
              <div key={t._id} className="border p-3 rounded flex justify-between items-center bg-gray-50">
                <div>
                  <p className="font-bold text-blue-600">{t.user?.name} (NIS: {t.user?.nis})</p>
                  <p className="text-sm">Buku: {t.book?.title}</p>
                </div>
                <button onClick={() => handleApproveBooking(t._id)} className="bg-green-500 text-white px-3 py-1 rounded">Setujui Fisik</button>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL 2: WALK-IN (Jalur B) */}
        <div className="bg-white p-6 rounded shadow border-t-4 border-blue-500">
          <h2 className="font-bold text-lg mb-4">JALUR B: Peminjaman Walk-In</h2>
          <form onSubmit={handleWalkIn} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Scan NIS Murid</label>
              <input type="text" className="w-full border p-2 rounded" value={walkinNis} onChange={e=>setWalkinNis(e.target.value)} required placeholder="Contoh: 1001"/>
            </div>
            <div>
              <label className="block text-sm mb-1">Scan ID/Judul Buku</label>
              <input type="text" className="w-full border p-2 rounded" value={walkinBookId} onChange={e=>setWalkinBookId(e.target.value)} required placeholder="Ketikan judul / ID buku"/>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded">Pinjamkan Buku</button>
          </form>
        </div>

        {/* PANEL 3: BUKU KEMBALI & DENDA OTOMATIS */}
        <div className="bg-white p-6 rounded shadow border-t-4 border-red-500 lg:col-span-2">
          <h2 className="font-bold text-lg mb-4">Pengembalian Buku (Sedang Dipinjam)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left bg-white border">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-3">Murid</th>
                  <th className="p-3">Buku</th>
                  <th className="p-3">Tgl Jatuh Tempo</th>
                  <th className="p-3">Jalur</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {actives.map(t => (
                  <tr key={t._id} className="border-b">
                    <td className="p-3">{t.user?.name}</td>
                    <td className="p-3">{t.book?.title}</td>
                    <td className="p-3 text-red-600 font-semibold">{t.tanggalJatuhTempo ? new Date(t.tanggalJatuhTempo).toLocaleDateString() : '-'}</td>
                    <td className="p-3">{t.jalur}</td>
                    <td className="p-3">
                      <button onClick={() => handleReturn(t._id)} className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">Terima Kembali & Cek Denda</button>
                    </td>
                  </tr>
                ))}
                {actives.length === 0 && <tr><td colSpan="5" className="p-3 text-center text-gray-500">Tidak ada buku yang sedang dipinjam.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* PANEL 4: PEMBAYARAN DENDA MANUAL */}
        <div className="bg-white p-6 rounded shadow lg:col-span-2 border-t-4 border-green-500">
          <h2 className="font-bold text-lg mb-4">Kasir: Pembayaran Denda Murid</h2>
          <form onSubmit={handlePayFine} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm mb-1">NIS Murid</label>
              <input type="text" className="w-full border p-2 rounded" value={fineNis} onChange={e=>setFineNis(e.target.value)} required/>
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">Nominal Bayar (Rp)</label>
              <input type="number" className="w-full border p-2 rounded" value={fineAmount} onChange={e=>setFineAmount(e.target.value)} required/>
            </div>
            <button className="bg-green-600 text-white px-6 py-2 rounded h-[42px]">Bayar Lunas</button>
          </form>
        </div>

        {/* PANEL 5: PENGATURAN AKUN ADMIN */}
        <div className="bg-white p-6 rounded shadow border-t-4 border-purple-500 lg:col-span-2">
          <h2 className="font-bold text-lg mb-4">Pengaturan Akun Admin</h2>
          <form onSubmit={handleUpdateProfile} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm mb-1">Username / NIS Admin</label>
              <input 
                type="text" 
                className="w-full border p-2 rounded outline-none focus:ring focus:ring-purple-200" 
                value={newNis} 
                onChange={e => setNewNis(e.target.value)} 
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">Password Baru</label>
              <input 
                type="password" 
                placeholder="Kosongkan jika tidak ingin mengubah sandi"
                className="w-full border p-2 rounded outline-none focus:ring focus:ring-purple-200" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
              />
            </div>
            <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded h-[42px] hover:bg-purple-700 transition">
              Simpan & Logout
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}