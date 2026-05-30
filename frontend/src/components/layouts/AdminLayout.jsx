import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Book, Users, History, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const navs = [
    { name: 'Sirkulasi Dasar', path: '/admin', icon: <Home size={20} /> },
    { name: 'Data Buku', path: '/admin/books', icon: <Book size={20} /> },
    { name: 'Data Murid', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Riwayat Transaksi', path: '/admin/history', icon: <History size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col">
        <div className="p-4 border-b border-blue-700">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navs.map((nav) => (
            <Link
              key={nav.path}
              to={nav.path}
              className={`flex items-center gap-3 p-3 rounded hover:bg-blue-700 transition-colors ${
                location.pathname === nav.path ? 'bg-blue-700' : ''
              }`}
            >
              {nav.icon}
              {nav.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded bg-red-600 hover:bg-red-700 transition-colors text-left"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white p-4 shadow-sm mb-4">
          <h1 className="text-xl font-semibold text-gray-800">Sistem Informasi Perpustakaan Sekolah</h1>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
