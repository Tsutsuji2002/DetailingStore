import type { WorkShiftConfig, ScheduleShift } from '@/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5080/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('motoshine_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || data?.title || 'Lỗi kết nối máy chủ.');
  }
  return data as T;
}

export const workShiftsApi = {
  // Shift Configs (Ca Làm Việc)
  getConfigs(all?: boolean): Promise<WorkShiftConfig[]> {
    const qs = all ? '?all=true' : '';
    return request<WorkShiftConfig[]>(`/workshifts/configs${qs}`);
  },

  createConfig(payload: Partial<WorkShiftConfig>): Promise<WorkShiftConfig> {
    return request<WorkShiftConfig>('/workshifts/configs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateConfig(id: string, payload: Partial<WorkShiftConfig>): Promise<WorkShiftConfig> {
    return request<WorkShiftConfig>(`/workshifts/configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteConfig(id: string): Promise<void> {
    return request<void>(`/workshifts/configs/${id}`, {
      method: 'DELETE',
    });
  },

  // Assigned Work Shifts (Phân Ca)
  getAssignedShifts(params?: { staffId?: string; date?: string }): Promise<ScheduleShift[]> {
    const query = new URLSearchParams();
    if (params?.staffId) query.append('staffId', params.staffId);
    if (params?.date) query.append('date', params.date);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<ScheduleShift[]>(`/workshifts${qs}`);
  },

  assignShift(payload: { staffId: string; shiftTypeId: string; date: string; notes?: string }): Promise<ScheduleShift> {
    return request<ScheduleShift>('/workshifts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteAssignedShift(id: string): Promise<void> {
    return request<void>(`/workshifts/${id}`, {
      method: 'DELETE',
    });
  },
};

export default workShiftsApi;
