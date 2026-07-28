import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Lightbulb, Activity } from 'lucide-react';
import type { DiseaseRiskData } from '../types';
import clsx from 'clsx';

interface DiseaseRiskCardProps {
  diseaseRisk: DiseaseRiskData | null;
  score: number;
}

function riskColor(value: number): string {
  if (value < 25) return 'from-secondary-500 to-emerald-400';
  if (value < 50) return 'from-accent-500 to-yellow-400';
  if (value < 75) return 'from-orange-500 to-red-400';
  return 'from-red-500 to-rose-400';
}

function riskLevel(value: number): { label: string; color: string } {
  if (value < 25) return { label: 'Low', color: 'text-secondary-400' };
  if (value < 50) return { label: 'Moderate', color: 'text-accent-400' };
  if (value < 75) return { label: 'High', color: 'text-orange-400' };
  return { label: 'Critical', color: 'text-red-400' };
}

function borderColor(value: number): string {
  if (value < 25) return 'border-secondary-500/20';
  if (value < 50) return 'border-accent-500/20';
  if (value < 75) return 'border-orange-500/20';
  return 'border-red-500/20';
}

export default function DiseaseRiskCard({ diseaseRisk, score }: DiseaseRiskCardProps) {
  if (!diseaseRisk) {
    return (
      <div className="glass-card">
        <div className="skeleton h-6 w-40 mb-4" />
        <div className="skeleton h-32 w-full" />
      </div>
    );
  }

  const risks = [
    { label: 'Cervical Spondylosis', value: diseaseRisk.cervical_spondylosis, key: 'cervical' },
    { label: 'Carpal Tunnel', value: diseaseRisk.carpal_tunnel, key: 'carpal' },
    { label: 'Text Neck', value: diseaseRisk.text_neck, key: 'text_neck' },
    { label: 'Scoliosis Risk', value: diseaseRisk.scoliosis_risk, key: 'scoliosis' },
    { label: 'Lower Back Pain', value: diseaseRisk.lower_back_pain, key: 'lower_back' },
  ];

  const overall = diseaseRisk.overall_risk_score;
  const level = riskLevel(overall);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx('glass-card border', borderColor(overall))}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Disease Risk</h3>
            <p className="text-xs text-dark-400">Risk assessment</p>
          </div>
        </div>
        <div className="text-right">
          <motion.div
            key={score}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold text-white"
          >
            {score.toFixed(0)}
          </motion.div>
          <span className="text-xs text-dark-400">/100</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 px-3 py-2 rounded-lg bg-dark-800/50">
        <span className="text-xs text-dark-400">Overall Risk</span>
        <div className="flex items-center gap-2">
          <motion.span
            key={overall}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            className="text-lg font-bold text-white"
          >
            {overall.toFixed(0)}%
          </motion.span>
          <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full bg-dark-800', level.color)}>
            {level.label}
          </span>
        </div>
      </div>

      <div className="space-y-2.5 mb-4">
        {risks.map((risk) => {
          const pct = risk.value;
          return (
            <div key={risk.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-dark-400">{risk.label}</span>
                <span className="text-xs font-medium text-dark-300">{pct.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={clsx('h-full rounded-full bg-gradient-to-r', riskColor(pct))}
                />
              </div>
            </div>
          );
        })}
      </div>

      {diseaseRisk.recommendations.length > 0 && (
        <div className="glass rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-accent-400" />
            <span className="text-xs font-medium text-accent-300">Recommendations</span>
          </div>
          <ul className="space-y-1.5">
            {diseaseRisk.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-dark-300">
                <Activity className="w-3 h-3 mt-0.5 text-primary-400 flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
