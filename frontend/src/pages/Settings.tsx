import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Camera,
  Sliders,
  Bell,
  Database,
  Sun,
  Moon,
  Trash2,
  Save,
  X,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useStore } from '../store/useStore';

export default function Settings() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const [cameraDevice, setCameraDevice] = useState('default');
  const [analysisInterval, setAnalysisInterval] = useState(2000);
  const [neckThreshold, setNeckThreshold] = useState(15);
  const [shoulderThreshold, setShoulderThreshold] = useState(20);
  const [spineThreshold, setSpineThreshold] = useState(15);
  const [notifications, setNotifications] = useState(true);
  const [dataRetention, setDataRetention] = useState(90);
  const [confirmReset, setConfirmReset] = useState(false);
  const [saved, setSaved] = useState(true);

  const markUnsaved = () => setSaved(false);

  const handleSave = () => {
    toast.success('Settings saved successfully');
    setSaved(true);
  };

  const handleReset = () => {
    setCameraDevice('default');
    setAnalysisInterval(2000);
    setNeckThreshold(15);
    setShoulderThreshold(20);
    setSpineThreshold(15);
    setNotifications(true);
    setDataRetention(90);
    setTheme('dark');
    setConfirmReset(false);
    toast.success('Settings reset to defaults');
    setSaved(true);
  };

  const sections = [
    {
      id: 'camera',
      icon: Camera,
      title: 'Camera Settings',
      description: 'Configure your camera input device',
      content: (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-dark-400 mb-1.5 block">Camera Device</label>
            <select
              value={cameraDevice}
              onChange={(e) => { setCameraDevice(e.target.value); markUnsaved(); }}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-primary-500/50 transition-all duration-300 ease-out appearance-none"
            >
              <option value="default">Default Camera</option>
              <option value="external">External Camera</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      id: 'analysis',
      icon: Sliders,
      title: 'Analysis Settings',
      description: 'Configure analysis parameters',
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-dark-400 mb-1.5 block">
              Analysis Interval: {(analysisInterval / 1000).toFixed(1)}s
            </label>
            <input
              type="range"
              min={500}
              max={5000}
              step={100}
              value={analysisInterval}
              onChange={(e) => { setAnalysisInterval(Number(e.target.value)); markUnsaved(); }}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-[10px] text-dark-500">
              <span>0.5s</span>
              <span>5.0s</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'posture',
      icon: RefreshCw,
      title: 'Posture Thresholds',
      description: 'Set angle thresholds for posture alerts',
      content: (
        <div className="space-y-4">
          {[
            { label: 'Neck Angle Threshold', value: neckThreshold, set: setNeckThreshold, max: 45 },
            { label: 'Shoulder Angle Threshold', value: shoulderThreshold, set: setShoulderThreshold, max: 45 },
            { label: 'Spine Angle Threshold', value: spineThreshold, set: setSpineThreshold, max: 45 },
          ].map((t) => (
            <div key={t.label}>
              <label className="text-xs text-dark-400 mb-1.5 block">{t.label}: {t.value}°</label>
              <input
                type="range"
                min={5}
                max={t.max}
                step={1}
                value={t.value}
                onChange={(e) => { t.set(Number(e.target.value)); markUnsaved(); }}
                className="w-full accent-primary-500"
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notifications',
      description: 'Control alert preferences',
      content: (
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] cursor-pointer">
            <div>
              <span className="text-sm text-white">Push Notifications</span>
              <p className="text-xs text-dark-400">Receive alerts for poor posture</p>
            </div>
            <button
              onClick={() => { setNotifications(!notifications); markUnsaved(); }}
              className={clsx(
                'w-10 h-6 rounded-full transition-all duration-300 ease-out relative',
                notifications ? 'bg-primary-500' : 'bg-dark-600'
              )}
            >
              <div
                className={clsx(
                  'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ease-out',
                  notifications ? 'left-[18px]' : 'left-0.5'
                )}
              />
            </button>
          </label>
        </div>
      ),
    },
    {
      id: 'data',
      icon: Database,
      title: 'Data & Storage',
      description: 'Manage data retention and storage',
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-dark-400 mb-1.5 block">Data Retention Period: {dataRetention} days</label>
            <input
              type="range"
              min={7}
              max={365}
              step={1}
              value={dataRetention}
              onChange={(e) => { setDataRetention(Number(e.target.value)); markUnsaved(); }}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-[10px] text-dark-500">
              <span>7 days</span>
              <span>365 days</span>
            </div>
          </div>
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all duration-300 ease-out flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Reset All Data
          </button>
        </div>
      ),
    },
    {
      id: 'theme',
      icon: theme === 'dark' ? Moon : Sun,
      title: 'Appearance',
      description: 'Customize the interface theme',
      content: (
        <div className="flex gap-3">
          {[
            { mode: 'dark' as const, label: 'Dark', icon: Moon },
            { mode: 'light' as const, label: 'Light', icon: Sun },
          ].map((t) => (
            <button
              key={t.mode}
              onClick={() => { setTheme(t.mode); markUnsaved(); }}
              className={clsx(
                'flex-1 p-4 rounded-xl flex flex-col items-center gap-2 transition-all duration-300 ease-out',
                theme === t.mode
                  ? 'bg-primary-500/10 border border-primary-500/30 text-primary-400'
                  : 'bg-white/[0.03] border border-white/[0.06] text-dark-400 hover:text-white'
              )}
            >
              <t.icon className="w-6 h-6" />
              <span className="text-sm font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-full max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <SettingsIcon className="w-6 h-6 text-primary-400" />
          Settings
        </h1>
        <p className="text-sm text-dark-400 mt-1">Configure your ergonomic monitoring preferences</p>
      </motion.div>

      <div className="space-y-4 mb-8">
        {sections.map((section, i) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <section.icon className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{section.title}</h3>
                <p className="text-xs text-dark-400">{section.description}</p>
              </div>
            </div>
            {section.content}
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          onClick={() => { setSaved(true); toast('Changes discarded'); }}
          disabled={saved}
          className={clsx(
            'px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out flex items-center gap-2',
            saved
              ? 'text-dark-500 cursor-not-allowed'
              : 'glass glass-hover text-dark-300'
          )}
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saved}
          className={clsx(
            'px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out flex items-center gap-2',
            saved
              ? 'bg-primary-500/30 text-primary-300 cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25'
          )}
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <AnimatePresence>
        {confirmReset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 max-w-sm mx-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <Trash2 className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Reset All Data?</h3>
              </div>
              <p className="text-sm text-dark-300 mb-6">
                This will permanently delete all your analysis sessions, trends, and stored data. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl glass glass-hover text-sm font-medium text-dark-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all duration-300 ease-out"
                >
                  Reset All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
