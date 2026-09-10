import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Brain, RefreshCw, ArrowRight, Shield, Activity, Eye as EyeIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useStore } from '../store/useStore';

function AuthVisualPanel() {
  return (
    <div className="hidden lg:flex flex-1 relative overflow-hidden bg-dark-950 items-center justify-center">
      <div className="absolute inset-0">
        <div className="absolute top-[10%] left-[15%] w-[300px] h-[300px] rounded-full bg-primary-500/[0.06] blur-[80px] animate-aurora" />
        <div className="absolute bottom-[15%] right-[10%] w-[250px] h-[250px] rounded-full bg-violet-500/[0.05] blur-[80px] animate-aurora" style={{ animationDelay: '-4s' }} />
        <div className="absolute top-[50%] left-[60%] w-[200px] h-[200px] rounded-full bg-secondary-500/[0.04] blur-[60px] animate-aurora" style={{ animationDelay: '-8s' }} />
        <div className="bg-grid absolute inset-0 opacity-[0.08]" />
      </div>

      <div className="relative z-10 px-12 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 via-violet-500 to-primary-600 flex items-center justify-center shadow-2xl shadow-primary-500/30 mb-6">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-dark-50 mb-3">
            Protect your <span className="gradient-text">ergonomic health</span>
          </h2>
          <p className="text-dark-400 leading-relaxed">
            AI-powered posture analysis, eye blink detection, and disease risk prediction — all in real-time.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4"
        >
          {[
            { icon: Activity, label: 'Real-time posture tracking', color: 'text-primary-400', bg: 'bg-primary-500/10' },
            { icon: EyeIcon, label: 'Eye blink rate monitoring', color: 'text-secondary-400', bg: 'bg-secondary-500/10' },
            { icon: Shield, label: 'Disease risk assessment', color: 'text-accent-400', bg: 'bg-accent-500/10' },
          ].map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl glass"
            >
              <div className={`w-9 h-9 rounded-lg ${feature.bg} flex items-center justify-center`}>
                <feature.icon className={`w-4 h-4 ${feature.color}`} />
              </div>
              <span className="text-sm text-dark-200">{feature.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { setAuth, token } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (token) navigate('/');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    setUnverifiedEmail(null);
    try {
      const res = await api.login(email, password);
      setAuth(res.user, res.access_token);
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate('/');
    } catch (err: any) {
      if (err.message?.includes('not verified')) {
        setUnverifiedEmail(err.email || email);
        toast.error('Email not verified. Check your inbox or resend the code.');
      } else {
        toast.error(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail) return;
    setResending(true);
    try {
      await api.resendOtp(unverifiedEmail);
      toast.success('Verification code resent!');
      navigate(`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <AuthVisualPanel />

      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none lg:hidden">
          <div className="absolute top-[5%] right-[10%] w-[300px] h-[300px] rounded-full bg-primary-500/[0.04] blur-[80px] animate-aurora" />
          <div className="absolute bottom-[10%] left-[5%] w-[250px] h-[250px] rounded-full bg-violet-500/[0.03] blur-[80px] animate-aurora" style={{ animationDelay: '-4s' }} />
          <div className="bg-grid absolute inset-0 opacity-[0.08]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">
              <span className="gradient-text">Ergo</span>
              <span className="text-dark-50/70">Guard</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dark-50 mb-2">Welcome back</h1>
            <p className="text-sm text-dark-400">Sign in to your ErgoGuard account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setUnverifiedEmail(null); }}
                  placeholder="you@example.com"
                  className="input-premium pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-dark-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-premium pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {unverifiedEmail && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-accent-500/[0.08] border border-accent-500/20"
            >
              <p className="text-xs text-accent-400 text-center mb-3">
                Your email is not verified yet.
              </p>
              <button
                onClick={handleResend}
                disabled={resending}
                className="w-full py-2 rounded-lg bg-accent-500/15 hover:bg-accent-500/25 text-accent-400 text-xs font-medium transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Sending...' : 'Resend verification code'}
              </button>
            </motion.div>
          )}

          <p className="text-center text-sm text-dark-400 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors inline-flex items-center gap-1 group">
              Create one
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
