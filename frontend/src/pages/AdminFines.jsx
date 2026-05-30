import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Wallet, Plus, Trash2, Play, CheckCircle2, Users, AlertCircle } from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';
import api from '../services/api';

export default function AdminFines() {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [queue, setQueue] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setAllUsers(data);
      setUsers(data.filter(u => u.dendaAktif > 0).map(u => ({
        ...u,
        _searchText: `${u.nis} ${u.name}`
      })));
    } catch (err) {
      toast.error('Gagal mengambil data murid');
    }
  };

  const addToQueue = () => {
    if (!selectedUser) {
      toast.error('Pilih murid terlebih dahulu');
      return;
    }
    const nominal = Number(amount);
    if (!nominal || nominal <= 0) {
      toast.error('Masukkan nominal yang valid');
      return;
    }
    if (nominal > selectedUser.dendaAktif) {
      toast.error(`Nominal melebihi denda aktif (Rp ${selectedUser.dendaAktif.toLocaleString('id-ID')})`);
      return;
    }

    setQueue(prev => [...prev, {
      id: Date.now(),
      user: selectedUser,
      amount: nominal
    }]);
    setSelectedUser(null);
    setAmount('');
    toast.success('Ditambahkan ke antrian');
  };

  const removeFromQueue = (id) => {
    setQueue(prev => prev.filter(q => q.id !== id));
  };

  const payFullAmount = () => {
    if (!selectedUser) return;
    setAmount(String(selectedUser.dendaAktif));
  };

  const processAll = async () => {
    if (queue.length === 0) return;
    setProcessing(true);
    setResults([]);
    const newResults = [];

    for (const item of queue) {
      try {
        const res = await api.post('/users/pay-fine', {
          nis: item.user.nis,
          amount: item.amount
        });
        newResults.push({
          ...item,
          success: true,
          message: `Lunas. Sisa: Rp ${res.data.user.dendaAktif.toLocaleString('id-ID')}`
        });
      } catch (err) {
        newResults.push({
          ...item,
          success: false,
          message: err.response?.data?.message || 'Gagal'
        });
      }
    }

    setResults(newResults);
    const successCount = newResults.filter(r => r.success).length;
    const failCount = newResults.filter(r => !r.success).length;

    if (successCount > 0) toast.success(`${successCount} pembayaran berhasil diproses`);
    if (failCount > 0) toast.error(`${failCount} pembayaran gagal`);

    setQueue([]);
    fetchUsers();
    setProcessing(false);
  };

  const totalDendaAntrian = queue.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Pembayaran Denda</h2>
        <p className="text-sm text-slate-400 mt-0.5">Proses pelunasan denda murid, bisa antrian batch</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{users.length}</p>
              <p className="text-xs text-slate-400">Murid Punya Denda</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">Rp {allUsers.reduce((s, u) => s + (u.dendaAktif || 0), 0).toLocaleString('id-ID')}</p>
              <p className="text-xs text-slate-400">Total Denda Aktif</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">Rp {totalDendaAntrian.toLocaleString('id-ID')}</p>
              <p className="text-xs text-slate-400">Total di Antrian</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form - Left */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Plus size={16} className="text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">Tambah Pembayaran</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Pilih Murid (dengan denda)</label>
                <SearchableSelect
                  options={users}
                  value={selectedUser}
                  onChange={setSelectedUser}
                  placeholder="Cari NIS atau nama murid..."
                  renderOption={(u) => (
                    <div className="flex items-center justify-between w-full gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-[10px] font-bold text-rose-600 shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-700 text-sm truncate">{u.name}</p>
                          <p className="text-[11px] text-slate-400">NIS: {u.nis}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md shrink-0">
                        Rp {u.dendaAktif.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                  renderSelected={(u) => (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-[10px] font-bold text-rose-600 shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-700 truncate">{u.name}</span>
                      <span className="text-rose-600 text-xs font-semibold">Rp {u.dendaAktif.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Nominal Bayar (Rp)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    className="flex-1 border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                  />
                  {selectedUser && (
                    <button
                      type="button"
                      onClick={payFullAmount}
                      className="shrink-0 bg-slate-100 text-slate-600 px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-200 transition-colors"
                    >
                      Lunas Penuh
                    </button>
                  )}
                </div>
                {selectedUser && (
                  <p className="text-[11px] text-slate-400 mt-1">Denda aktif: Rp {selectedUser.dendaAktif.toLocaleString('id-ID')}</p>
                )}
              </div>

              <button
                type="button"
                onClick={addToQueue}
                disabled={!selectedUser || !amount}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-2.5 rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Tambah ke Antrian
              </button>
            </div>
          </div>
        </div>

        {/* Queue - Right */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Wallet size={16} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Antrian Pembayaran</h3>
                  <p className="text-[11px] text-slate-400">{queue.length} item menunggu</p>
                </div>
              </div>
              {queue.length > 0 && (
                <button
                  onClick={processAll}
                  disabled={processing}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-60 flex items-center gap-1.5"
                >
                  {processing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      Proses Semua ({queue.length})
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-50">
              {queue.length === 0 && results.length === 0 && (
                <div className="text-center py-12">
                  <Wallet size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">Belum ada pembayaran di antrian</p>
                  <p className="text-[11px] text-slate-300 mt-1">Pilih murid dan masukkan nominal, lalu tambahkan</p>
                </div>
              )}

              {queue.map((item) => (
                <div key={item.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-600 shrink-0">
                    {item.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-700 truncate">{item.user.name} <span className="text-slate-400 font-normal">({item.user.nis})</span></p>
                    <p className="text-xs text-slate-400">Denda: Rp {item.user.dendaAktif.toLocaleString('id-ID')}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 shrink-0">Rp {item.amount.toLocaleString('id-ID')}</span>
                  <button onClick={() => removeFromQueue(item.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-400 hover:text-rose-600 transition-colors shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {/* Results */}
              {results.length > 0 && (
                <>
                  <div className="px-5 py-2 bg-slate-50">
                    <p className="text-xs font-medium text-slate-500">Hasil Proses</p>
                  </div>
                  {results.map((item) => (
                    <div key={item.id} className={`px-5 py-3 flex items-center gap-3 ${item.success ? 'bg-emerald-50/30' : 'bg-rose-50/30'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.success ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {item.success ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">!</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-700 truncate">{item.user.name} - Rp {item.amount.toLocaleString('id-ID')}</p>
                        <p className={`text-xs ${item.success ? 'text-emerald-600' : 'text-rose-600'}`}>{item.message}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
