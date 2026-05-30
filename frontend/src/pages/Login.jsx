import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Login() {
  const [nis, setNis] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm border-t-4 border-blue-600">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Login SIP Sekolah</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-semibold text-sm">NIS / Admin ID</label>
          <input 
            type="text" 
            className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            value={nis}
            onChange={(e) => setNis(e.target.value)}
            required
            placeholder="Masukkan NIS Anda"
          />
        </div>
        <div className="mb-8">
          <label className="block text-gray-700 mb-2 font-semibold text-sm">Password</label>
          <input 
            type="password" 
            className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>
        <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition-colors font-bold shadow-md">
          {loading ? 'Memeriksa...' : 'Masuk Sistem'}
        </button>
      </form>
    </div>
  );
}
