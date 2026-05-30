import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function AdminHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/transactions');
      setHistory(data);
    } catch(err) {
      toast.error('Gagal mengambil riwayat transaksi');
    }
    setLoading(false);
  };

  const filteredHistory = history.filter(h => 
    h.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.book?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Laporan Keseluruhan Transaksi</h2>
      
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Cari berdasarkan nama murid, buku, atau status..." 
          className="w-full md:w-1/3 border p-2 rounded focus:outline-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? <p>Loading riwayat...</p> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left bg-white border text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Murid (NIS)</th>
                <th className="p-3">Buku</th>
                <th className="p-3">Jalur</th>
                <th className="p-3">Status</th>
                <th className="p-3">Denda (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(h => (
                <tr key={h._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-500">{h.tanggalPinjam ? new Date(h.tanggalPinjam).toLocaleDateString() : 'Belum'}</td>
                  <td className="p-3 font-semibold">{h.user?.name} <span className="text-xs text-gray-400">({h.user?.nis})</span></td>
                  <td className="p-3">{h.book?.title}</td>
                  <td className="p-3 uppercase text-xs font-bold text-gray-600">{h.jalur?.replace('_', ' ')}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-white text-xs ${
                      h.status === 'pending' ? 'bg-yellow-500' :
                      h.status === 'dipinjam' ? 'bg-blue-500' : 
                      'bg-green-500'
                    }`}>
                      {h.status}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-red-500">{h.denda > 0 ? h.denda : '-'}</td>
                </tr>
              ))}
              {filteredHistory.length === 0 && <tr><td colSpan="6" className="p-3 text-center text-gray-500">Tidak ada riwayat ditemukan.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
