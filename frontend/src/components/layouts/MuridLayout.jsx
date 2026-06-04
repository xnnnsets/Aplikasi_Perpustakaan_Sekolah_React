import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, User, LogOut, Menu, X, BookOpen } from 'lucide-react';
import { clearCurrentUser, getCurrentUser } from '../../services/auth';

export default function MuridLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userData = getCurrentUser() || {};

  const handleLogout = () => {
    clearCurrentUser();
    navigate('/');
  };

  const navs = [
    { name: 'Cari & Booking', path: '/murid', icon: <Home size={18} /> },
    { name: 'Profil & Riwayat', path: '/murid/profile', icon: <User size={18} /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-emerald-800 via-emerald-700 to-teal-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Brand */}
        <div className="p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <BookOpen size={18} className="text-emerald-200" />
          </div>
          <div>
            <h2 className="font-bold text-base tracking-tight">Portal Murid</h2>
            <p className="text-[11px] text-emerald-300/70">SIP Sekolah</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navs.map((nav) => (
            <Link
              key={nav.path}
              to={nav.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(nav.path)
                  ? 'bg-white/15 text-white shadow-lg shadow-black/10'
                  : 'text-emerald-200/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {nav.icon}
              {nav.name}
            </Link>
          ))}
        </nav>

        {/* User info & Logout */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-200">
              {(userData.name || 'M').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userData.name || 'Murid'}</p>
              <p className="text-[11px] text-emerald-300/60">NIS: {userData.nis || '-'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-red-300/80 hover:bg-red-500/15 hover:text-red-200 transition-all duration-200"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 lg:px-6 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 hover:bg-slate-100 rounded-xl transition-colors">
            <Menu size={20} className="text-slate-600" />
          </button>
          <h1 className="text-lg font-semibold text-slate-800 tracking-tight">Perpustakaan Sekolah</h1>
        </header>
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
