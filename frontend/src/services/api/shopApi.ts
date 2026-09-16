import type { ShopInfo } from '@/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5080/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('motoshine_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.message || data?.title || 'Đã có lỗi xảy ra khi kết nối máy chủ.';
    throw new Error(errorMsg);
  }

  return data as T;
}

export const shopApi = {
  async getShopInfo(): Promise<ShopInfo> {
    return request<ShopInfo>('/shop-settings', {
      method: 'GET',
    });
  },

  async updateShopInfo(data: Partial<ShopInfo>): Promise<ShopInfo> {
    return request<ShopInfo>('/shop-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

export default shopApi;
