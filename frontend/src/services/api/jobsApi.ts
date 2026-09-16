import type { Job } from '@/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5080/api';

type UpsertJobPayload = Partial<Job> & { requirements?: string[]; benefits?: string[] };

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

export const jobsApi = {
  getAll(all?: boolean): Promise<Job[]> {
    const qs = all ? '?all=true' : '';
    return request<Job[]>(`/jobs${qs}`);
  },
  getById(id: string): Promise<Job> {
    return request<Job>(`/jobs/${id}`);
  },
  create(payload: UpsertJobPayload): Promise<Job> {
    return request<Job>('/jobs', { method: 'POST', body: JSON.stringify(payload) });
  },
  update(id: string, payload: UpsertJobPayload): Promise<Job> {
    return request<Job>(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  delete(id: string): Promise<void> {
    return request<void>(`/jobs/${id}`, { method: 'DELETE' });
  },
};

export default jobsApi;
