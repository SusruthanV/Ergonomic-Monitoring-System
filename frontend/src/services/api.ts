const API_BASE = '';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    let detail = errorBody;
    try {
      const parsed = JSON.parse(errorBody);
      detail = parsed.detail || errorBody;
    } catch {}
    throw new Error(detail);
  }
  return response.json();
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export const api = {
  async register(email: string, name: string, password: string, phone?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password, phone: phone || null }),
    });
    return handleResponse(res);
  },

  async verifyOtp(email: string, otp: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    return handleResponse(res);
  },

  async resendOtp(email: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(res);
  },

  async login(email: string, password: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.status === 403) {
      const body = await res.json().catch(() => ({}));
      const err: any = new Error(body.detail || 'Email not verified');
      err.email = body.email || email;
      throw err;
    }
    return handleResponse(res);
  },

  async getMe(): Promise<any> {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { ...authHeaders() },
    });
    return handleResponse(res);
  },

  async updateProfile(data: { name?: string; phone?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/api/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async fetchDashboardSummary(): Promise<any> {
    const res = await fetch(`${API_BASE}/api/dashboard/summary`);
    const data = await handleResponse<any>(res);
    return {
      ...data,
      total_hours: (data.total_duration_minutes || 0) / 60,
      avg_score: data.average_scores?.overall || 0,
      best_score: data.best_score || data.latest_scores?.[0]?.overall_score || 0,
    };
  },

  async fetchTrends(days: number = 7): Promise<any> {
    const res = await fetch(`${API_BASE}/api/dashboard/trends?days=${days}`);
    return handleResponse(res);
  },

  async fetchSessions(): Promise<any> {
    const res = await fetch(`${API_BASE}/api/history/sessions`);
    const data = await handleResponse<any>(res);
    const sessions = (data.sessions || []).map((s: any) => ({
      ...s,
      duration_minutes: s.total_duration_minutes ?? s.duration_minutes ?? 0,
      overall_score: s.avg_overall_score ?? s.overall_score ?? 0,
      notes: s.notes ?? null,
    }));
    return { sessions };
  },

  async fetchSessionDetail(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/api/history/sessions/${id}`);
    return handleResponse(res);
  },

  async fetchSessionPosture(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/api/history/sessions/${id}/posture`);
    return handleResponse(res);
  },

  async fetchSessionBlinks(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/api/history/sessions/${id}/blinks`);
    return handleResponse(res);
  },

  async deleteSession(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/history/sessions/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete session: ${res.status}`);
    }
  },

  async updateSessionNotes(id: number, notes: string | null): Promise<any> {
    const res = await fetch(`${API_BASE}/api/history/sessions/${id}/notes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    return handleResponse(res);
  },

  async fetchRealtime(sessionId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/api/dashboard/realtime/${sessionId}`);
    return handleResponse(res);
  },

  async fetchAchievements(): Promise<any> {
    const res = await fetch(`${API_BASE}/api/achievements`, {
      headers: { ...authHeaders() },
    });
    return handleResponse(res);
  },

  async fetchAchievementStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/api/achievements/stats`, {
      headers: { ...authHeaders() },
    });
    return handleResponse(res);
  },

  async checkBadges(): Promise<any> {
    const res = await fetch(`${API_BASE}/api/achievements/check`, {
      method: 'POST',
      headers: { ...authHeaders() },
    });
    return handleResponse(res);
  },

  async downloadReport(period: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/reports/generate?period=${period}`, {
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error('Failed to generate report');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ergoguard-report-${period}-${new Date().toISOString().split('T')[0]}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async fetchExerciseRecommendations(): Promise<any> {
    const res = await fetch(`${API_BASE}/api/exercises/recommendations`);
    return handleResponse(res);
  },

  async fetchAllExercises(category?: string): Promise<any> {
    const url = category
      ? `${API_BASE}/api/exercises/all?category=${category}`
      : `${API_BASE}/api/exercises/all`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async fetchExerciseById(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/exercises/${id}`);
    return handleResponse(res);
  },

  async compareSessions(sessionId1: number, sessionId2: number): Promise<any> {
    const res = await fetch(`${API_BASE}/api/compare?session_id_1=${sessionId1}&session_id_2=${sessionId2}`);
    return handleResponse(res);
  },
};
