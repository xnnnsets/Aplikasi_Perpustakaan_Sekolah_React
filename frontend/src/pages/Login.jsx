import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BookOpen, Eye, EyeOff, LogIn, User } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [nis, setNis] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/login', { nis, password });
      localStorage.setItem('user', JSON.stringify(res.data));

      toast.success('Login berhasil!');
      if (res.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/murid');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal login, cek koneksi server');
    }
    setLoading(false);
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-72 h-72 bg-indigo-500/30 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SIP Sekolah</h1>
          <p className="text-indigo-200/70 mt-1 text-sm">Sistem Informasi Perpustakaan</p>
        </div>

        {/* Login Card */}
        <form onSubmit={handleLogin} className="glass rounded-2xl p-8 shadow-2xl shadow-black/20">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Masuk ke akun Anda</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-600 mb-1.5 font-medium text-sm">NIS / Admin ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  className="w-full border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 text-slate-800 placeholder-slate-400 transition-all"
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  required
                  placeholder="Masukkan NIS Anda"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 mb-1.5 font-medium text-sm">Password</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full border border-slate-200 pl-4 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 text-slate-800 placeholder-slate-400 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Masukkan password"
                />
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memeriksa...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Masuk Sistem
              </>
            )}
          </button>
        </form>

        <p className="text-center text-indigo-200/40 text-xs mt-6">Sistem Informasi Perpustakaan Sekolah</p>
      </div>
    </div>
  );
}
