import {
  WorkOrderDto,
  WorkOrderDetailDto,
  CreateWorkOrderDto,
  UpdateWorkOrderStatusDto,
  AvailableStaffDto,
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

export const workOrderApi = {
  async getWorkOrders(params?: { staffId?: string; status?: string; date?: string }): Promise<WorkOrderDto[]> {
    const query = new URLSearchParams();
    if (params?.staffId) query.append('staffId', params.staffId);
    if (params?.status) query.append('status', params.status);
    if (params?.date) query.append('date', params.date);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<WorkOrderDto[]>(`/work-orders${qs}`);
  },

  async getWorkOrderById(id: string): Promise<WorkOrderDetailDto> {
    return request<WorkOrderDetailDto>(`/work-orders/${id}`);
  },

  async createWorkOrder(data: CreateWorkOrderDto): Promise<WorkOrderDto> {
    return request<WorkOrderDto>('/work-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateWorkOrderStatus(id: string, data: UpdateWorkOrderStatusDto): Promise<WorkOrderDto> {
    return request<WorkOrderDto>(`/work-orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getAvailableStaff(startTime: string, endTime: string): Promise<AvailableStaffDto[]> {
    const query = new URLSearchParams();
    query.append('startTime', startTime);
    query.append('endTime', endTime);
    return request<AvailableStaffDto[]>(`/staff/available?${query.toString()}`);
  },
};
