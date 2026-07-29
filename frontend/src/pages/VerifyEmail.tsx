import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, RefreshCw, Brain } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }
    setLoading(true);
    try {
      await api.verifyOtp(email, code);
      toast.success('Email verified successfully! You can now sign in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.resendOtp(email);
      toast.success('New OTP sent to your email');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-80 h-80 rounded-full opacity-[0.03]"
            style={{
              background: `radial-gradient(circle, rgba(99,102,241,${0.3 - i * 0.05}), transparent)`,
              left: `${20 + i * 25}%`,
              top: `${25 + (i % 2) * 25}%`,
            }}
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
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
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Verify your email</h1>
            <p className="text-sm text-dark-400 mt-1">
              We sent a 6-digit code to{' '}
              <span className="text-primary-400 font-medium">{email}</span>
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-8">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-dark-800 border border-white/[0.08] text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-violet-600 hover:from-primary-600 hover:to-violet-700 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Verify Email
              </>
            )}
          </button>

          <div className="text-center mt-6">
            <button
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-1.5 text-sm text-dark-400 hover:text-primary-400 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              {resending ? 'Sending...' : 'Resend code'}
            </button>
          </div>

          <p className="text-center text-xs text-dark-500 mt-4">
            The code expires in 10 minutes. Check your spam folder if you don't see it.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
