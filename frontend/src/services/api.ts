const API_BASE = '';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error (${response.status}): ${errorBody}`);
  }
  return response.json();
}

export const api = {
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
