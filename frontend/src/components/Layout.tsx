import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Timer, Award } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { useStore } from '../store/useStore';
import clsx from 'clsx';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function Layout() {
  const location = useLocation();
  const { isSessionActive, sessionElapsed, latestScores } = useStore();

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      <aside className="w-64 flex-shrink-0 glass border-r border-white/[0.06] z-30">
        <Navbar />
      </aside>

      <main className="flex-1 overflow-y-auto relative">
        <div className="bg-grid absolute inset-0 opacity-[0.15] pointer-events-none" />
        <div className="relative z-10 min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="p-6 pb-4"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        <footer>
          <div className="glass border-t border-white/[0.06] px-6 py-2.5">
            <div className="flex items-center justify-between text-xs text-dark-400">
              <div className="flex items-center gap-2 md:gap-4 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-secondary-500" />
                  <span className="text-secondary-400">Connected</span>
                </div>
                {isSessionActive && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-primary-400" />
                      <span className="text-primary-300">{formatTime(sessionElapsed)}</span>
                    </div>
                    {latestScores && (
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-accent-400" />
                        <span className="text-accent-300">{latestScores.overall.toFixed(1)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 md:gap-4 whitespace-nowrap">
                <span>ErgoGuard v1.0.0</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary-500 animate-pulse-soft" />
                  <span>All systems nominal</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
