import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
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

function BackgroundOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-primary-500/[0.04] blur-[100px] animate-aurora" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[400px] h-[400px] rounded-full bg-violet-500/[0.04] blur-[100px] animate-aurora" style={{ animationDelay: '-4s' }} />
      <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-secondary-500/[0.03] blur-[80px] animate-aurora" style={{ animationDelay: '-8s' }} />
    </div>
  );
}

export default function Layout() {
  const location = useLocation();
  const { isSessionActive, sessionElapsed, latestScores, isFullscreen } = useStore();

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      <div className="noise-overlay" />

      {!isFullscreen && (
        <aside className="w-64 flex-shrink-0 glass border-r border-dark-800/50 z-30 relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -bottom-[30%] -right-[50%] w-[200px] h-[200px] rounded-full bg-primary-500/[0.03] blur-[60px]" />
          </div>
          <Navbar />
        </aside>
      )}

      <main className="flex-1 overflow-hidden relative">
        <BackgroundOrbs />
        <div className="bg-grid absolute inset-0 opacity-[0.12] pointer-events-none" />
        <div className={clsx('relative z-10 h-full', isFullscreen ? 'overflow-hidden' : 'overflow-y-auto')}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={clsx('p-6 pb-4', isFullscreen && 'p-4 h-full')}
          >
            <Outlet />
          </motion.div>
        </div>

        {!isFullscreen && (
          <footer>
            <div className="glass border-t border-dark-800/50 px-6 py-2.5 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/[0.02] via-transparent to-secondary-500/[0.02] pointer-events-none" />
              <div className="relative flex items-center justify-between text-xs text-dark-400">
                <div className="flex items-center gap-2 md:gap-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <div className="relative">
                      <Wifi className="w-3.5 h-3.5 text-secondary-500" />
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-secondary-500 animate-pulse-soft" />
                    </div>
                    <span className="text-secondary-400">Connected</span>
                  </div>
                  {isSessionActive && (
                    <>
                      <div className="w-px h-3 bg-dark-700" />
                      <div className="flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-primary-400" />
                        <span className="text-primary-300 font-mono">{formatTime(sessionElapsed)}</span>
                      </div>
                      {latestScores && (
                        <>
                          <div className="w-px h-3 bg-dark-700" />
                          <div className="flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-accent-400" />
                            <span className="text-accent-300 font-semibold">{latestScores.overall.toFixed(1)}</span>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 md:gap-4 whitespace-nowrap">
                  <span className="text-dark-500">ErgoGuard v1.0.0</span>
                  <div className="w-px h-3 bg-dark-700" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary-500 shadow-lg shadow-secondary-500/50 animate-pulse-soft" />
                    <span>All systems nominal</span>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
}
