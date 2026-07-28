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
} from 'lucide-react';

const features = [
  {
    icon: Activity,
    title: 'Posture Analysis',
    description: 'Real-time tracking of neck, shoulder, and spine angles with instant feedback on your sitting posture.',
    gradient: 'from-primary-400 to-violet-500',
    delay: 0.1,
  },
  {
    icon: Eye,
    title: 'Eye Blink Detection',
    description: 'Monitor blink rate and EAR values to prevent digital eye strain and computer vision syndrome.',
    gradient: 'from-secondary-400 to-teal-500',
    delay: 0.2,
  },
  {
    icon: Shield,
    title: 'Disease Prediction',
    description: 'Early risk assessment for cervical spondylosis, carpal tunnel, text neck, and other ergonomic conditions.',
    gradient: 'from-accent-400 to-orange-500',
    delay: 0.3,
  },
  {
    icon: Award,
    title: 'Smart Scoring',
    description: 'Comprehensive ergonomic scoring with personalized recommendations for improvement.',
    gradient: 'from-pink-400 to-rose-500',
    delay: 0.4,
  },
];

const stats = [
  { label: 'Sessions Analyzed', value: '1,247', icon: Zap },
  { label: 'Avg Posture Score', value: '94.2%', icon: TrendingUp },
  { label: 'Disease Types', value: '12', icon: Shield },
  { label: 'Active Users', value: '8.5K', icon: Users },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 rounded-full opacity-[0.03]"
              style={{
                background: `radial-gradient(circle, rgba(99,102,241,${0.3 - i * 0.04}), transparent)`,
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 15, 0],
              }}
              transition={{
                duration: 6 + i,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 pt-16 pb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-medium">
              AI-Powered Ergonomic Monitoring
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold mt-6 mb-4"
          >
            <span className="gradient-text">ErgoGuard</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-dark-300 max-w-2xl mx-auto mb-8"
          >
            Your Complete Ergonomic Health Companion
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-sm text-dark-400 max-w-xl mx-auto mb-8"
          >
            Real-time posture analysis, eye blink detection, and disease risk prediction powered by computer vision AI.
            Protect your health while you work.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate('/analysis')}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-violet-600 hover:from-primary-600 hover:to-violet-700 text-white font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
            >
              Start Analysis
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 rounded-xl glass glass-hover text-white font-semibold text-sm transition-all duration-200"
            >
              View Dashboard
            </button>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-12">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
            className="glass rounded-xl p-4 text-center"
          >
            <stat.icon className="w-5 h-5 text-primary-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-dark-400 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-12">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
            whileHover={{ y: -5 }}
            className="glass rounded-2xl p-6 group cursor-pointer"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}
            >
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-sm text-dark-400 leading-relaxed">{feature.description}</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary-400 opacity-0 group-hover:opacity-100 transition-all duration-200">
              Learn more <ArrowRight className="w-3 h-3" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
