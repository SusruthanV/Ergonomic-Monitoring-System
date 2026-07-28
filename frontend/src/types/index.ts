export interface PostureData {
  neck_angle: number;
  shoulder_angle: number;
  spine_angle: number;
  is_good_posture: boolean;
  feedback: string;
}

export interface EyeBlinkData {
  ear_value: number;
  is_blink: boolean;
  blink_count: number;
  blink_rate: number;
  total_blinks: number;
}

export interface DiseaseRiskData {
  cervical_spondylosis: number;
  carpal_tunnel: number;
  text_neck: number;
  scoliosis_risk: number;
  lower_back_pain: number;
  overall_risk_score: number;
  recommendations: string[];
}

export interface ScoreData {
  overall: number;
  posture: number;
  eye_blink: number;
  disease_risk: number;
  grade: string;
  breakdown: {
    posture_weight: number;
    eye_blink_weight: number;
    disease_risk_weight: number;
  };
  recommendations: string[];
}

export interface AnalysisResult {
  type: string;
  posture: PostureData;
  eye_blink: EyeBlinkData;
  disease_risk: DiseaseRiskData;
  scores: ScoreData;
  timestamp: string;
  overlay_frame?: string;
}

export interface SessionSummary {
  id: number;
  created_at: string;
  ended_at: string | null;
  duration_minutes: number;
  overall_score: number;
}

export interface TrendData {
  date: string;
  avg_posture_score: number;
  avg_eye_blink_score: number;
  avg_disease_risk_score: number;
  avg_overall_score: number;
}

export interface ConnectionStats {
  connected: boolean;
  reconnectAttempts: number;
  lastConnected: Date | null;
}
