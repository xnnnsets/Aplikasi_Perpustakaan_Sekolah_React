import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Settings, Clock, CalendarDays, DollarSign, MessageSquare, Save } from 'lucide-react';
import api from '../services/api';

const HARI_OPTIONS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    dendaPerHari: 1000,
    limitPeminjamanGlobal: 3,
    jamBuka: '07:00',
    jamTutup: '15:00',
    hariOperasional: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
    pesanSanksi: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setSettings(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const toggleHari = (hari) => {
    setSettings(prev => ({
      ...prev,
      hariOperasional: prev.hariOperasional.includes(hari)
        ? prev.hariOperasional.filter(h => h !== hari)
        : [...prev.hariOperasional, hari]
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', {
        dendaPerHari: Number(settings.dendaPerHari),
        limitPeminjamanGlobal: Number(settings.limitPeminjamanGlobal),
        jamBuka: settings.jamBuka,
        jamTutup: settings.jamTutup,
        hariOperasional: settings.hariOperasional,
        pesanSanksi: settings.pesanSanksi
      });
      toast.success('Pengaturan berhasil disimpan!');
    } catch (err) {
      toast.error('Gagal menyimpan pengaturan.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Pengaturan Sistem</h2>
        <p className="text-sm text-slate-400 mt-0.5">Konfigurasi parameter global perpustakaan</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Denda Per Hari */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <DollarSign size={16} className="text-rose-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Nominal Denda</h3>
              <p className="text-[11px] text-slate-400">Denda keterlambatan per hari (isi 0 untuk non-aktif)</p>
            </div>
          </div>
          <div className="p-5">
            <div className="max-w-xs">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Denda Per Hari (Rp)</label>
              <input
                type="number"
                min="0"
                className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                value={settings.dendaPerHari}
                onChange={e => setSettings({ ...settings, dendaPerHari: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Limit Peminjaman */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Settings size={16} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Batas Peminjaman Global</h3>
              <p className="text-[11px] text-slate-400">Berlaku untuk semua murid kecuali jika murid punya batas khusus</p>
            </div>
          </div>
          <div className="p-5">
            <div className="max-w-xs">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Maksimal Buku Aktif</label>
              <input
                type="number"
                min="0"
                className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                value={settings.limitPeminjamanGlobal}
                onChange={e => setSettings({ ...settings, limitPeminjamanGlobal: e.target.value })}
              />
              <p className="text-[11px] text-slate-400 mt-1">Isi 0 jika ingin menonaktifkan limit global.</p>
            </div>
          </div>
        </div>

        {/* Jam Operasional */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Clock size={16} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Jam Operasional</h3>
              <p className="text-[11px] text-slate-400">Jam buka dan tutup perpustakaan</p>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Jam Buka</label>
                <input
                  type="time"
                  className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={settings.jamBuka}
                  onChange={e => setSettings({ ...settings, jamBuka: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Jam Tutup</label>
                <input
                  type="time"
                  className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={settings.jamTutup}
                  onChange={e => setSettings({ ...settings, jamTutup: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hari Operasional */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CalendarDays size={16} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Hari Operasional</h3>
              <p className="text-[11px] text-slate-400">Pilih hari kerja perpustakaan</p>
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap gap-2">
              {HARI_OPTIONS.map(hari => {
                const active = settings.hariOperasional.includes(hari);
                return (
                  <button
                    key={hari}
                    type="button"
                    onClick={() => toggleHari(hari)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {hari}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pesan Sanksi */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <MessageSquare size={16} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Template Pesan Sanksi</h3>
              <p className="text-[11px] text-slate-400">Pesan yang ditampilkan pada murid yang disanksi</p>
            </div>
          </div>
          <div className="p-5">
            <textarea
              rows={3}
              className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              value={settings.pesanSanksi}
              onChange={e => setSettings({ ...settings, pesanSanksi: e.target.value })}
              placeholder="Masukkan pesan sanksi untuk murid..."
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-sm disabled:opacity-60 flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save size={16} />
              Simpan Pengaturan
            </>
          )}
        </button>
      </form>
    </div>
  );
}
