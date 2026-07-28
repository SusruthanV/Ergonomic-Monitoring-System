import { create } from 'zustand';
import type {
  PostureData,
  EyeBlinkData,
  DiseaseRiskData,
  ScoreData,
  TrendData,
  SessionSummary,
} from '../types';

// Raw backend response types (may differ from frontend types)
interface RawAnalysisResult {
  type: string;
  posture: PostureData | null;
  eye_blink: any;
  disease_risk: any;
  scores: any;
  timestamp: string;
  overlay_frame?: string;
}

interface AppState {
  isSessionActive: boolean;
  currentSessionId: number | null;
  latestPosture: PostureData | null;
  latestEyeBlink: EyeBlinkData | null;
  latestDiseaseRisk: DiseaseRiskData | null;
  latestScores: ScoreData | null;
  postureHistory: PostureData[];
  blinkHistory: EyeBlinkData[];
  scoreHistory: ScoreData[];
  dashboardSummary: any;
  trends: TrendData[];
  sessions: SessionSummary[];
  sessionStartTime: number | null;
  sessionElapsed: number;

  setSessionActive: (active: boolean) => void;
  setCurrentSessionId: (id: number | null) => void;
  updateAnalysis: (result: RawAnalysisResult) => void;
  addToHistory: (result: RawAnalysisResult) => void;
  setDashboardSummary: (data: any) => void;
  setTrends: (data: TrendData[]) => void;
  setSessions: (sessions: SessionSummary[]) => void;
  setSessionElapsed: (elapsed: number) => void;
  resetSessionData: () => void;
}

export const useStore = create<AppState>((set) => ({
  isSessionActive: false,
  currentSessionId: null,
  latestPosture: null,
  latestEyeBlink: null,
  latestDiseaseRisk: null,
  latestScores: null,
  postureHistory: [],
  blinkHistory: [],
  scoreHistory: [],
  dashboardSummary: null,
  trends: [],
  sessions: [],
  sessionStartTime: null,
  sessionElapsed: 0,

  setSessionActive: (active) =>
    set({
      isSessionActive: active,
      sessionStartTime: active ? Date.now() : null,
      sessionElapsed: active ? 0 : 0,
    }),

  setCurrentSessionId: (id) => set({ currentSessionId: id }),

  updateAnalysis: (rawResult: RawAnalysisResult) => {
    const blink = rawResult.eye_blink;
    const scores = rawResult.scores;
    const risk = rawResult.disease_risk;
    set({
      latestPosture: rawResult.posture,
      latestEyeBlink: blink ? {
        ear_value: blink.ear_value ?? 0,
        is_blink: blink.is_blink ?? false,
        blink_count: blink.blink_count ?? 0,
        blink_rate: blink.blink_rate_per_minute ?? blink.blink_rate ?? 0,
        total_blinks: blink.total_blinks ?? 0,
      } : null,
      latestDiseaseRisk: risk ? {
        cervical_spondylosis: risk.cervical_spondylosis ?? 0,
        carpal_tunnel: risk.carpal_tunnel ?? risk.carpal_tunnel_syndrome ?? 0,
        text_neck: risk.text_neck ?? 0,
        scoliosis_risk: risk.scoliosis_risk ?? 0,
        lower_back_pain: risk.lower_back_pain ?? 0,
        overall_risk_score: risk.overall_risk_score ?? 0,
        recommendations: risk.recommendations ?? [],
      } : null,
      latestScores: scores ? {
        overall: scores.overall_score ?? scores.overall ?? 0,
        posture: scores.posture_score ?? scores.posture ?? 0,
        eye_blink: scores.eye_blink_score ?? scores.eye_blink ?? 0,
        disease_risk: scores.disease_risk_score ?? scores.disease_risk ?? 0,
        grade: scores.grade ?? 'N/A',
        breakdown: scores.breakdown ?? {},
        recommendations: scores.recommendations ?? [],
      } : null,
    });
  },

  addToHistory: (rawResult: RawAnalysisResult) => {
    const blink = rawResult.eye_blink;
    const scores = rawResult.scores;
    set((state) => ({
      postureHistory: [...state.postureHistory.slice(-100), rawResult.posture].filter(Boolean) as PostureData[],
      blinkHistory: [...state.blinkHistory.slice(-100), blink ? {
        ear_value: blink.ear_value ?? 0,
        is_blink: blink.is_blink ?? false,
        blink_count: blink.blink_count ?? 0,
        blink_rate: blink.blink_rate_per_minute ?? blink.blink_rate ?? 0,
        total_blinks: blink.total_blinks ?? 0,
      } : null].filter(Boolean) as EyeBlinkData[],
      scoreHistory: [...state.scoreHistory.slice(-100), scores ? {
        overall: scores.overall_score ?? scores.overall ?? 0,
        posture: scores.posture_score ?? scores.posture ?? 0,
        eye_blink: scores.eye_blink_score ?? scores.eye_blink ?? 0,
        disease_risk: scores.disease_risk_score ?? scores.disease_risk ?? 0,
        grade: scores.grade ?? 'N/A',
        breakdown: scores.breakdown ?? {},
        recommendations: scores.recommendations ?? [],
      } : null].filter(Boolean) as ScoreData[],
    }));
  },

  setDashboardSummary: (data) => set({ dashboardSummary: data }),

  setTrends: (data) => set({ trends: data }),

  setSessions: (sessions) => set({ sessions }),

  setSessionElapsed: (elapsed) => set({ sessionElapsed: elapsed }),

  resetSessionData: () =>
    set({
      latestPosture: null,
      latestEyeBlink: null,
      latestDiseaseRisk: null,
      latestScores: null,
      postureHistory: [],
      blinkHistory: [],
      scoreHistory: [],
      sessionElapsed: 0,
    }),
}));
