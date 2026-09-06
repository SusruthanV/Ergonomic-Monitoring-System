import { useLayoutEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useStore } from '../store/useStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useStore((s) => s.theme);

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? '#f1f5f9' : '#0f172a');
    }

    const html = document.documentElement;
    html.classList.add('theme-switching');
    const t = window.setTimeout(() => html.classList.remove('theme-switching'), 300);
    return () => {
      window.clearTimeout(t);
      html.classList.remove('theme-switching');
    };
  }, [theme]);

  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: theme === 'light' ? '#ffffff' : '#1e293b',
            color: theme === 'light' ? '#0f172a' : '#f1f5f9',
            border: theme === 'light' ? '1px solid rgba(15,23,42,0.1)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '13px',
            backdropFilter: 'blur(24px)',
            boxShadow: theme === 'light' ? '0 8px 24px rgba(15,23,42,0.12)' : 'none',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: theme === 'light' ? '#ffffff' : '#1e293b' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: theme === 'light' ? '#ffffff' : '#1e293b' },
          },
        }}
      />
    </>
  );
}
