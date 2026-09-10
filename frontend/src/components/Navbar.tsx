import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  LayoutDashboard,
  Activity,
  Clock,
  Award,
  FileText,
  Settings,
  Brain,
  LogOut,
  User,
  Dumbbell,
  GitCompareArrows,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analysis', label: 'Analysis', icon: Activity },
  { to: '/history', label: 'History', icon: Clock },
  { to: '/achievements', label: 'Achievements', icon: Award },
  { to: '/exercises', label: 'Exercises', icon: Dumbbell },
  { to: '/compare', label: 'Compare', icon: GitCompareArrows },
  { to: '/reports', label: 'Reports', icon: FileText },
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
    <nav className="flex flex-col h-full p-4 relative z-10">
      <div className="flex items-center gap-3 px-3 py-4 mb-6 flex-shrink-0">
        <div className="relative group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 via-violet-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow duration-300">
            <Brain className="w-5.5 h-5.5 text-white" />
          </div>
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary-500/20 to-violet-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="min-w-0">
          <span className="text-xl font-bold block leading-tight">
            <span className="gradient-text">Ergo</span>
            <span className="text-dark-50/80">Guard</span>
          </span>
          <span className="text-[10px] text-dark-500 font-medium tracking-wider uppercase">Ergonomic Health</span>
        </div>
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto min-h-0 scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              clsx(
                'sidebar-item group',
                isActive
                  ? 'active text-dark-50'
                  : 'text-dark-400 hover:text-dark-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute left-0 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-primary-400 to-violet-500 shadow-lg shadow-primary-500/30"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 relative z-10',
                  isActive
                    ? 'bg-primary-500/15'
                    : 'bg-transparent group-hover:bg-dark-800/50'
                )}>
                  <item.icon
                    className={clsx(
                      'w-[18px] h-[18px] transition-all duration-300',
                      isActive && 'text-primary-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.4)]'
                    )}
                  />
                </div>
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400 shadow-lg shadow-primary-400/50 relative z-10"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {user && (
        <div className="px-3 py-3 mb-2 glass rounded-xl relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/[0.03] to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500/20 to-violet-600/20 flex items-center justify-center border border-primary-500/10 flex-shrink-0">
              <User className="w-4 h-4 text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark-50 truncate">{user.name}</p>
              <p className="text-[11px] text-dark-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-3 py-2 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-dark-400 hover:text-red-400 group"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:bg-red-500/10">
            <LogOut className="w-[18px] h-[18px]" />
          </div>
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
