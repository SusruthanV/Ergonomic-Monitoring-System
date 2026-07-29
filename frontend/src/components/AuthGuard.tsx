import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { api } from '../services/api';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { token, user, setAuth, logout, isAuthLoading } = useStore();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!user) {
      api.getMe()
        .then((userData) => {
          const existingToken = localStorage.getItem('token');
          if (existingToken) {
            setAuth(userData, existingToken);
          }
        })
        .catch(() => {
          logout();
          navigate('/login');
        });
    }
  }, [token, user]);

  if (!token) return null;
  if (!user && !isAuthLoading) return null;

  return <>{children}</>;
}
