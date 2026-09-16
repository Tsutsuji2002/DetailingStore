import type { User } from '@/types';

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

export const usersApi = {
  // Get all users
  getUsers: async (role?: string): Promise<User[]> => {
    const query = role ? `?role=${role}` : '';
    return request<User[]>(`/users${query}`);
  },

  // Get staff & admin users for work shift schedule
  getStaffUsers: async (): Promise<User[]> => {
    return request<User[]>('/users/staff');
  },

  // Update user role (Admin only)
  updateUserRole: async (userId: string, role: string): Promise<User> => {
    return request<User>(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },
};

export default usersApi;
