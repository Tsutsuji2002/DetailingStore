import { ServiceBooking } from '@/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5080/api';

function getToken(): string | null {
  return (
    localStorage.getItem('auth_token') ||
    localStorage.getItem('motoshine_token') ||
    localStorage.getItem('token')
  );
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
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
    const errorMsg = data?.message || data?.title || 'Đã có lỗi xảy ra khi gọi máy chủ.';
    throw new Error(errorMsg);
  }

  return data as T;
}

export const bookingsApi = {
  async getBookings(params?: { date?: string; staffId?: string; status?: string }): Promise<ServiceBooking[]> {
    const query = new URLSearchParams();
    if (params?.date) query.append('date', params.date);
    if (params?.staffId) query.append('staffId', params.staffId);
    if (params?.status) query.append('status', params.status);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<ServiceBooking[]>(`/bookings${qs}`);
  },

  async getBookingById(id: string): Promise<ServiceBooking> {
    return request<ServiceBooking>(`/bookings/${id}`);
  },

  async createBooking(data: Partial<ServiceBooking>): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateBooking(id: string, data: Partial<ServiceBooking>): Promise<{ message: string }> {
    return request<{ message: string }>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async updateBookingStatus(id: string, status: string): Promise<{ message: string; status: string }> {
    return request<{ message: string; status: string }>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteBooking(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/bookings/${id}`, {
      method: 'DELETE',
    });
  },
};

