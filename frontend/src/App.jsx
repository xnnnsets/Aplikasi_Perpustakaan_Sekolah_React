import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import MuridDashboard from './pages/MuridDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
        <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
          <div className="container mx-auto font-bold text-xl">Sistem Informasi Perpustakaan Sekolah</div>
          <button onClick={() => { localStorage.clear(); window.location.href = '/'}} className="text-sm bg-red-500 px-3 py-1 rounded hover:bg-red-600">Logout</button>
        </header>
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/murid" element={<MuridDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
export default App;
