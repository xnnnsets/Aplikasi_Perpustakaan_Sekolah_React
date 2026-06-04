import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';

// Admin Pages
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminBooks from './pages/AdminBooks';
import AdminUsers from './pages/AdminUsers';
import AdminHistory from './pages/AdminHistory';
import AdminSettings from './pages/AdminSettings';
import AdminWalkIn from './pages/AdminWalkIn';
import AdminFines from './pages/AdminFines';

// Murid Pages
import MuridLayout from './components/layouts/MuridLayout';
import MuridDashboard from './pages/MuridDashboard';
import MuridProfile from './pages/MuridProfile';
import { getCurrentUser } from './services/auth';

import './index.css';

function RequireRole({ allowedRoles }) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin' : '/murid'} replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Admin Rounting */}
        <Route element={<RequireRole allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="walk-in" element={<AdminWalkIn />} />
            <Route path="fines" element={<AdminFines />} />
            <Route path="books" element={<AdminBooks />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="history" element={<AdminHistory />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Murid Routing */}
        <Route element={<RequireRole allowedRoles={['murid']} />}>
          <Route path="/murid" element={<MuridLayout />}>
            <Route index element={<MuridDashboard />} />
            <Route path="profile" element={<MuridProfile />} />
          </Route>
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
