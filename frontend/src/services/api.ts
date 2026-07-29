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

  async fetchRealtime(sessionId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/api/dashboard/realtime/${sessionId}`);
    return handleResponse(res);
  },
};
