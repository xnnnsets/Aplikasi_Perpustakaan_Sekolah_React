import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, User, LogOut } from 'lucide-react';

export default function MuridLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const navs = [
    { name: 'Cari & Booking', path: '/murid', icon: <Home size={20} /> },
    { name: 'Profil & Riwayat', path: '/murid/profile', icon: <User size={20} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-green-700 text-white flex flex-col">
        <div className="p-4 border-b border-green-600">
          <h2 className="text-xl font-bold">Portal Murid</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2 flex gap-4 md:gap-0 md:flex-col overflow-x-auto">
          {navs.map((nav) => (
            <Link
              key={nav.path}
              to={nav.path}
              className={`flex items-center gap-3 p-3 rounded hover:bg-green-600 transition-colors whitespace-nowrap ${
                location.pathname === nav.path ? 'bg-green-600' : ''
              }`}
            >
              {nav.icon}
              {nav.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-green-600 hidden md:block">
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
        <header className="bg-white p-4 shadow-sm mb-4 flex justify-between items-center md:block">
          <h1 className="text-xl font-semibold text-gray-800">Perpustakaan Sekolah</h1>
          <button onClick={handleLogout} className="md:hidden text-red-600 bg-red-100 px-3 py-1 rounded">Logout</button>
        </header>
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
