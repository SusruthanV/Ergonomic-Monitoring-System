import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, UserPlus, Brain } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useStore } from '../store/useStore';

export default function Register() {
  const navigate = useNavigate();
  const token = useStore((s) => s.token);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) navigate('/');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await api.register(email, name, password, phone || undefined);
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      toast.success(res.message || 'Registration successful! Check your email for OTP.');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-96 h-96 rounded-full opacity-[0.03]"
            style={{
              background: `radial-gradient(circle, rgba(99,102,241,${0.3 - i * 0.05}), transparent)`,
              left: `${15 + i * 20}%`,
              top: `${20 + (i % 2) * 30}%`,
            }}
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 border border-white/[0.06]">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create account</h1>
            <p className="text-sm text-dark-400 mt-1">Start your ergonomic journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-800 border border-white/[0.08] text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-800 border border-white/[0.08] text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-800 border border-white/[0.08] text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-dark-800 border border-white/[0.08] text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-violet-600 hover:from-primary-600 hover:to-violet-700 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-dark-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
