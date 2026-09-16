import type { MechanicDoc } from '@/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5080/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('motoshine_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  if (response.status === 204) return undefined as unknown as T;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || data?.title || 'Lỗi kết nối máy chủ.');
  }
  return data as T;
}

export interface CreateMechanicDocPayload {
  title: string;
  brand: string;
  vehicleModel: string;
  category: string;
  errorCode?: string;
  symptoms: string;
  contentHtml?: string;
  solutionSteps: string[];
  diagrams?: string[];
  videoUrl?: string;
}

export type UpdateMechanicDocPayload = CreateMechanicDocPayload;

const mechanicDocsApi = {
  getDocs(params?: { search?: string; brand?: string; category?: string }): Promise<MechanicDoc[]> {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.brand) qs.set('brand', params.brand);
    if (params?.category) qs.set('category', params.category);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return request<MechanicDoc[]>(`/mechanicdocs${query}`);
  },

  getDocById(id: string): Promise<MechanicDoc> {
    return request<MechanicDoc>(`/mechanicdocs/${id}`);
  },

  createDoc(payload: CreateMechanicDocPayload): Promise<MechanicDoc> {
    return request<MechanicDoc>('/mechanicdocs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateDoc(id: string, payload: UpdateMechanicDocPayload): Promise<MechanicDoc> {
    return request<MechanicDoc>(`/mechanicdocs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteDoc(id: string): Promise<void> {
    return request<void>(`/mechanicdocs/${id}`, { method: 'DELETE' });
  },
};

export default mechanicDocsApi;
