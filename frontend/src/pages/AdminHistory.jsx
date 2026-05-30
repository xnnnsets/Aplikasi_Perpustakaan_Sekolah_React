import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Search, History, FileText } from 'lucide-react';
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
    } catch (err) {
      toast.error('Gagal mengambil riwayat transaksi');
    }
    setLoading(false);
  };

  const filteredHistory = history.filter(h =>
    h.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.book?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
      case 'dipinjam': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
      case 'kembali': return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Riwayat Transaksi</h2>
          <p className="text-sm text-slate-400 mt-0.5">{filteredHistory.length} dari {history.length} transaksi</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, buku, atau status..."
            className="w-full border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <History size={16} className="text-slate-600" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Laporan Keseluruhan</h3>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Tanggal</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Murid</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Buku</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Jalur</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Denda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredHistory.map(h => (
                  <tr key={h._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 text-slate-500 text-xs">{h.tanggalPinjam ? new Date(h.tanggalPinjam).toLocaleDateString('id-ID') : 'Belum'}</td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium text-slate-700">{h.user?.name}</p>
                        <p className="text-[11px] text-slate-400">{h.user?.nis}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{h.book?.title}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase">{h.jalur?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle(h.status)}`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {h.denda > 0 ? (
                        <span className="text-rose-600 font-semibold text-xs">Rp {h.denda.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center">
                      <FileText size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-sm text-slate-400">Tidak ada riwayat ditemukan.</p>
                    </td>
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
