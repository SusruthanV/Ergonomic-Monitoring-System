import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import History from './pages/History';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import { useStore } from './store/useStore';
import { api } from './services/api';

function AuthInit({ children }: { children: React.ReactNode }) {
  const { token, setAuth, logout } = useStore();

  useEffect(() => {
    if (token) {
      api.getMe()
        .then((user) => setAuth(user, token))
        .catch(() => logout());
    } else {
      useStore.getState().loadAuth();
    }
  }, []);

  return <>{children}</>;
}

function ProtectedLayout() {
  return (
    <AuthGuard>
      <Layout />
    </AuthGuard>
  );
}

export default function App() {
  return (
    <AuthInit>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/" element={<ProtectedLayout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </AuthInit>
  );
}
