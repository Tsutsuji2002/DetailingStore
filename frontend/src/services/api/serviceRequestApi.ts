import {
  ServiceRequestDto,
  ServiceRequestDetailDto,
  CreateServiceRequestDto,
  AcceptServiceRequestDto,
  WorkOrderDto,
} from '@/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5080/api';

function getToken(): string | null {
  return (
    localStorage.getItem('auth_token') ||
    localStorage.getItem('motoshine_token') ||
    localStorage.getItem('token')
  );
}

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errorMessage?: string | null;
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

  const body = await response.json().catch(() => ({})) as ApiResponse<T>;

  if (!response.ok) {
    // Backend uses 'message' field, not 'errorMessage'
    const errorMsg = (body as any)?.message || body?.errorMessage || (body as any)?.title || 'Đã có lỗi xảy ra khi gọi máy chủ.';
    throw new Error(errorMsg);
  }

  if (!body.success) {
    throw new Error((body as any).message || body.errorMessage || 'Đã có lỗi xảy ra khi gọi máy chủ.');
  }

  // data may be null for empty lists — return as-is rather than throwing
  return body.data as T;
}

export const serviceRequestApi = {
  async getServiceRequests(params?: { status?: string }): Promise<ServiceRequestDto[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<ServiceRequestDto[]>(`/service-requests${qs}`);
  },

  async getServiceRequestById(id: string): Promise<ServiceRequestDetailDto> {
    return request<ServiceRequestDetailDto>(`/service-requests/${id}`);
  },

  async createServiceRequest(data: CreateServiceRequestDto): Promise<ServiceRequestDto> {
    return request<ServiceRequestDto>('/service-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async acceptServiceRequest(id: string, data: AcceptServiceRequestDto): Promise<WorkOrderDto> {
    return request<WorkOrderDto>(`/service-requests/${id}/accept`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async rejectServiceRequest(id: string): Promise<ServiceRequestDto> {
    return request<ServiceRequestDto>(`/service-requests/${id}/reject`, {
      method: 'PUT',
    });
  },
};

