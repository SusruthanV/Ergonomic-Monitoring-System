import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Eye,
  Shield,
  Award,
  ArrowRight,
  TrendingUp,
  Zap,
  Users,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const features = [
  {
    icon: Activity,
    title: 'Posture Analysis',
    description: 'Real-time tracking of neck, shoulder, and spine angles with instant feedback on your sitting posture.',
    gradient: 'from-primary-400 to-violet-500',
    glow: 'shadow-primary-500/20',
    delay: 0.1,
  },
  {
    icon: Eye,
    title: 'Eye Blink Detection',
    description: 'Monitor blink rate and EAR values to prevent digital eye strain and computer vision syndrome.',
    gradient: 'from-secondary-400 to-teal-500',
    glow: 'shadow-secondary-500/20',
    delay: 0.2,
  },
  {
    icon: Shield,
    title: 'Disease Prediction',
    description: 'Early risk assessment for cervical spondylosis, carpal tunnel, text neck, and other ergonomic conditions.',
    gradient: 'from-accent-400 to-orange-500',
    glow: 'shadow-accent-500/20',
    delay: 0.3,
  },
  {
    icon: Award,
    title: 'Smart Scoring',
    description: 'Comprehensive ergonomic scoring with personalized recommendations for improvement.',
    gradient: 'from-pink-400 to-rose-500',
    glow: 'shadow-pink-500/20',
    delay: 0.4,
  },
];

const stats = [
  { label: 'Sessions Analyzed', value: '1,247', icon: Zap, color: 'text-primary-400', bg: 'bg-primary-500/10' },
  { label: 'Avg Posture Score', value: '94.2%', icon: TrendingUp, color: 'text-secondary-400', bg: 'bg-secondary-500/10' },
  { label: 'Disease Types', value: '12', icon: Shield, color: 'text-accent-400', bg: 'bg-accent-500/10' },
  { label: 'Active Users', value: '8.5K', icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/10' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-72 h-72 rounded-full opacity-[0.025]"
              style={{
                background: `radial-gradient(circle, rgba(99,102,241,${0.4 - i * 0.04}), transparent)`,
                left: `${5 + i * 12}%`,
                top: `${10 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, 20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 7 + i,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.4,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 pt-20 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/[0.08] border border-primary-500/20 text-primary-400 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              AI-POWERED ERGONOMIC MONITORING
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-extrabold mt-8 mb-6 tracking-tight"
          >
            <span className="gradient-text">ErgoGuard</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl text-dark-200 max-w-2xl mx-auto mb-4 font-semibold"
          >
            Your Complete Ergonomic Health Companion
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base text-dark-400 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Real-time posture analysis, eye blink detection, and disease risk prediction powered by computer vision AI.
            Protect your health while you work.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate('/analysis')}
              className="btn-primary px-10 py-3.5 text-base"
            >
              <Zap className="w-4 h-4" />
              Start Analysis
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary px-10 py-3.5 text-base"
            >
              View Dashboard
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
            className="premium-card text-center group"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-dark-50">{stat.value}</div>
            <div className="text-xs text-dark-400 mt-1 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-16">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="premium-card group cursor-pointer gradient-border"
          >
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg ${feature.glow} group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
              <feature.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-dark-50 mb-2.5">{feature.title}</h3>
            <p className="text-sm text-dark-400 leading-relaxed mb-4">{feature.description}</p>
            <div className="flex items-center gap-1 text-xs font-semibold text-primary-400 opacity-0 group-hover:opacity-100 transition-all duration-300">
              Learn more <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
