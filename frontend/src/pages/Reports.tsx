import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Clock,
  Calendar,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const PERIODS = [
  { value: '1h', label: 'Last 1 Hour', icon: Clock, category: 'quick' },
  { value: '6h', label: 'Last 6 Hours', icon: Clock, category: 'quick' },
  { value: '12h', label: 'Last 12 Hours', icon: Clock, category: 'quick' },
  { value: '1d', label: 'Last 1 Day', icon: Calendar, category: 'daily' },
  { value: '3d', label: 'Last 3 Days', icon: Calendar, category: 'daily' },
  { value: '7d', label: 'Last 7 Days', icon: Calendar, category: 'weekly' },
  { value: '14d', label: 'Last 14 Days', icon: Calendar, category: 'weekly' },
  { value: '1m', label: 'Last 1 Month', icon: Calendar, category: 'monthly' },
  { value: '3m', label: 'Last 3 Months', icon: Calendar, category: 'monthly' },
  { value: '6m', label: 'Last 6 Months', icon: Calendar, category: 'monthly' },
  { value: '1y', label: 'Last 1 Year', icon: Calendar, category: 'yearly' },
  { value: 'all', label: 'All Time', icon: Calendar, category: 'yearly' },
];

const CATEGORIES = [
  { id: 'quick', label: 'Quick' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

export default function Reports() {
  const [generating, setGenerating] = useState<string | null>(null);

  const handleDownload = async (period: string) => {
    setGenerating(period);
    try {
      await api.downloadReport(period);
      toast.success('Report downloaded');
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="min-h-full">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary-400" />
          Reports
        </h1>
        <p className="text-sm text-dark-400 mt-1">
          Generate PDF reports for any time period
        </p>
      </motion.div>

      <div className="space-y-6">
        {CATEGORIES.map((cat, catIdx) => {
          const items = PERIODS.filter((p) => p.category === cat.id);
          if (items.length === 0) return null;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.1 }}
            >
              <h2 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-3">
                {cat.label}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map((period) => (
                  <button
                    key={period.value}
                    onClick={() => handleDownload(period.value)}
                    disabled={generating !== null}
                    className={clsx(
                      'premium-card text-left group gradient-border',
                      generating === period.value
                        ? 'border-primary-500/50 bg-primary-500/[0.05]'
                        : ''
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <period.icon className="w-5 h-5 text-dark-400 group-hover:text-primary-400 transition-colors" />
                      {generating === period.value ? (
                        <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 text-dark-500 group-hover:text-primary-400 transition-colors opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-dark-50">{period.label}</p>
                    <p className="text-xs text-dark-500 mt-1">PDF Report</p>
                  </button>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
