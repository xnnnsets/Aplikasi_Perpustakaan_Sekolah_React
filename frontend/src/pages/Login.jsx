import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [nis, setNis] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Pastikan backend berjalan di port 5000
      const res = await axios.post('http://localhost:5000/api/login', { nis, password });
      localStorage.setItem('user', JSON.stringify(res.data));
      
      if (res.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/murid');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal login, cek koneksi server');
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Login SIP</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">NIS / Admin ID</label>
          <input 
            type="text" 
            className="w-full border p-2 rounded focus:outline-blue-500"
            value={nis}
            onChange={(e) => setNis(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password</label>
          <input 
            type="password" 
            className="w-full border p-2 rounded focus:outline-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Masuk
        </button>
      </form>
    </div>
  );
}
