import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  LayoutDashboard,
  Activity,
  Clock,
  Settings,
  Brain,
  LogOut,
  User,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analysis', label: 'Analysis', icon: Activity },
  { to: '/history', label: 'History', icon: Clock },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useStore();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="flex flex-col h-full p-4">
      <div className="flex items-center gap-3 px-3 py-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold">
          <span className="gradient-text">Ergo</span>
          <span className="text-white/70">Guard</span>
        </span>
      </div>

      <div className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out group relative',
                isActive
                  ? 'text-white bg-primary-500/10'
                  : 'text-dark-400 hover:text-white hover:bg-white/5'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute left-0 w-1 h-6 rounded-r-full bg-gradient-to-b from-primary-400 to-violet-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon
                  className={clsx(
                    'w-5 h-5 transition-all duration-300 ease-out',
                    isActive && 'text-primary-400'
                  )}
                />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400 shadow-lg shadow-primary-400/50" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {user && (
        <div className="px-3 py-3 mb-2 glass rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/30 to-violet-600/30 flex items-center justify-center border border-white/[0.06]">
              <User className="w-4 h-4 text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-dark-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-3 py-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-dark-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 ease-out"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
