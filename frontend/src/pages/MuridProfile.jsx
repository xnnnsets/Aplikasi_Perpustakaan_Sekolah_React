import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function MuridProfile() {
  const [history, setHistory] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const [loading, setLoading] = useState(true);

  const localUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if(!localUser) return;
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Untuk profile ambil ulang data dari endpoint (kita pakai endpoint login tapi harusnya ada endpoint detail user. Di sini kita akali ambil dari history dulu atau pakai auth token)
      // Karena backend sederhana, user data sebagian ada di response history atau bisa kita set dari local storage. 
      // Untuk denda kita bisa update jika bikin endpoint user detail, atau cukup render dr state.
      // Kita mock profile info from local storage dulu
      setUserProfile(localUser);

      const res = await api.get(`/transactions/user/${localUser._id}`);
      setHistory(res.data);
    } catch(err) {
      toast.error('Gagal mengambil data profil');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded shadow border-l-4 border-green-600">
        <h2 className="text-2xl font-bold mb-4">Profil Saya</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nama Lengkap</p>
            <p className="font-semibold text-lg">{userProfile.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Nomor Induk Siswa (NIS)</p>
            <p className="font-semibold text-lg">{userProfile.nis}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role Akun</p>
            <p className="font-semibold text-lg capitalize">{userProfile.role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Tagihan Denda</p>
            <p className="font-semibold text-lg text-red-500">Rp {userProfile.dendaAktif || 0}</p>
            <p className="text-xs text-gray-400">Hubungi petugas untuk pelunasan.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Riwayat Peminjaman Pribadi</h2>
        {loading ? <p>Mencari riwayat...</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left bg-white border text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-3">Buku</th>
                  <th className="p-3">Jalur</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Tgl Pinjam</th>
                  <th className="p-3">Tgl Kembali</th>
                  <th className="p-3">Denda Jika Telat</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h._id} className="border-b">
                    <td className="p-3 font-semibold">{h.book?.title}</td>
                    <td className="p-3 uppercase text-xs ">{h.jalur?.replace('_', ' ')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-white text-xs ${
                        h.status === 'pending' ? 'bg-yellow-500' :
                        h.status === 'dipinjam' ? 'bg-blue-500' : 
                        'bg-green-500'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="p-3">{h.tanggalPinjam ? new Date(h.tanggalPinjam).toLocaleDateString() : '-'}</td>
                    <td className="p-3">{h.tanggalKembali ? new Date(h.tanggalKembali).toLocaleDateString() : '-'}</td>
                    <td className="p-3 text-red-500">{h.denda > 0 ? `Rp ${h.denda}` : '-'}</td>
                  </tr>
                ))}
                {history.length === 0 && <tr><td colSpan="6" className="p-3 text-center text-gray-500">Anda belum pernah meminjam buku.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
