import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ArrowRightLeft, Plus, Trash2, Play, CheckCircle2, Users, BookOpen } from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';
import api from '../services/api';

export default function AdminWalkIn() {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [queue, setQueue] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, booksRes] = await Promise.all([
        api.get('/users'),
        api.get('/books')
      ]);
      setUsers(usersRes.data.map(u => ({ ...u, _searchText: `${u.nis} ${u.name}` })));
      setBooks(booksRes.data.filter(b => b.stock > 0).map(b => ({ ...b, _searchText: `${b.title} ${b.author || ''}` })));
    } catch (err) {
      toast.error('Gagal mengambil data');
    }
  };

  const addToQueue = () => {
    if (!selectedUser || !selectedBook) {
      toast.error('Pilih murid dan buku terlebih dahulu');
      return;
    }
    const exists = queue.some(q => q.user._id === selectedUser._id && q.book._id === selectedBook._id);
    if (exists) {
      toast.error('Kombinasi murid & buku ini sudah ada di antrian');
      return;
    }
    setQueue(prev => [...prev, { id: Date.now(), user: selectedUser, book: selectedBook }]);
    setSelectedUser(null);
    setSelectedBook(null);
    toast.success('Ditambahkan ke antrian');
  };

  const removeFromQueue = (id) => {
    setQueue(prev => prev.filter(q => q.id !== id));
  };

  const processAll = async () => {
    if (queue.length === 0) return;
    setProcessing(true);
    setResults([]);
    const newResults = [];

    for (const item of queue) {
      try {
        await api.post('/transactions/walk-in', {
          nis: item.user.nis,
          titleOrId: item.book._id
        });
        newResults.push({ ...item, success: true, message: 'Berhasil' });
      } catch (err) {
        newResults.push({ ...item, success: false, message: err.response?.data?.message || 'Gagal' });
      }
    }

    setResults(newResults);
    const successCount = newResults.filter(r => r.success).length;
    const failCount = newResults.filter(r => !r.success).length;

    if (successCount > 0) toast.success(`${successCount} peminjaman berhasil diproses`);
    if (failCount > 0) toast.error(`${failCount} peminjaman gagal`);

    setQueue([]);
    fetchData();
    setProcessing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Peminjaman Walk-In</h2>
        <p className="text-sm text-slate-400 mt-0.5">Proses peminjaman langsung di perpustakaan, bisa antrian batch</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form - Left side */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Plus size={16} className="text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">Tambah ke Antrian</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Pilih Murid</label>
                <SearchableSelect
                  options={users}
                  value={selectedUser}
                  onChange={setSelectedUser}
                  placeholder="Cari NIS atau nama murid..."
                  renderOption={(u) => (
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-700 text-sm truncate">{u.name}</p>
                        <p className="text-[11px] text-slate-400">NIS: {u.nis}</p>
                      </div>
                    </div>
                  )}
                  renderSelected={(u) => (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-700 truncate">{u.name}</span>
                      <span className="text-slate-400 text-xs">({u.nis})</span>
                    </div>
                  )}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Pilih Buku</label>
                <SearchableSelect
                  options={books}
                  value={selectedBook}
                  onChange={setSelectedBook}
                  placeholder="Cari judul buku..."
                  renderOption={(b) => (
                    <div className="flex items-center gap-2.5">
                      {b.coverImage ? (
                        <img src={b.coverImage} alt="" referrerPolicy="no-referrer" className="w-7 h-9 object-cover rounded shrink-0" />
                      ) : (
                        <div className="w-7 h-9 bg-slate-100 rounded flex items-center justify-center shrink-0">
                          <BookOpen size={12} className="text-slate-300" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-slate-700 text-sm truncate">{b.title}</p>
                        <p className="text-[11px] text-slate-400">Stok: {b.stock} &middot; {b.author || '-'}</p>
                      </div>
                    </div>
                  )}
                  renderSelected={(b) => (
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-indigo-500 shrink-0" />
                      <span className="font-medium text-slate-700 truncate">{b.title}</span>
                      <span className="text-slate-400 text-xs">(Stok: {b.stock})</span>
                    </div>
                  )}
                />
              </div>

              <button
                type="button"
                onClick={addToQueue}
                disabled={!selectedUser || !selectedBook}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-2.5 rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Tambah ke Antrian
              </button>
            </div>
          </div>
        </div>

        {/* Queue - Right side */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Users size={16} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Antrian Walk-In</h3>
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
                  <ArrowRightLeft size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">Belum ada item di antrian</p>
                  <p className="text-[11px] text-slate-300 mt-1">Pilih murid dan buku, lalu tambahkan ke antrian</p>
                </div>
              )}

              {queue.map((item) => (
                <div key={item.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                    {item.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-700 truncate">{item.user.name} <span className="text-slate-400 font-normal">({item.user.nis})</span></p>
                    <p className="text-xs text-slate-400 truncate">{item.book.title}</p>
                  </div>
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
                        <p className="font-medium text-sm text-slate-700 truncate">{item.user.name} <span className="text-slate-400 font-normal">- {item.book.title}</span></p>
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
