const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5080/api';

export interface BackendServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface BackendService {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  priceFrom: number;
  priceTo?: number;
  duration?: string;
  images: string[];
  tags: string[];
  isActive: boolean;
  createdAt: string;
}

export const serviceApi = {
  async getServices(params?: { categoryId?: string; search?: string }): Promise<BackendService[]> {
    const query = new URLSearchParams();
    if (params?.categoryId && params.categoryId !== 'all') query.append('categoryId', params.categoryId);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE_URL}/services?${query.toString()}`);
    if (!res.ok) {
      throw new Error('Không thể tải danh sách dịch vụ từ máy chủ.');
    }
    const json = await res.json();
    return json.data || [];
  },

  async getCategories(): Promise<BackendServiceCategory[]> {
    const res = await fetch(`${API_BASE_URL}/services/categories`);
    if (!res.ok) {
      throw new Error('Không thể tải danh mục dịch vụ từ máy chủ.');
    }
    const json = await res.json();
    return json.data || [];
  },

  async createCategory(data: { name: string; icon?: string; slug?: string }): Promise<BackendServiceCategory> {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('motoshine_token');
    const res = await fetch(`${API_BASE_URL}/services/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || 'Tạo danh mục dịch vụ thất bại.');
    }
    return json.data;
  },

  async deleteCategory(id: string): Promise<void> {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('motoshine_token');
    const res = await fetch(`${API_BASE_URL}/services/categories/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || 'Xóa danh mục dịch vụ thất bại.');
    }
  },

  async createService(data: any): Promise<BackendService> {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('motoshine_token');
    const res = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || 'Tạo dịch vụ mới thất bại.');
    }
    return json.data;
  },

  async updateService(id: string, data: any): Promise<BackendService> {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('motoshine_token');
    const res = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || 'Cập nhật dịch vụ thất bại.');
    }
    return json.data;
  },

  async deleteService(id: string): Promise<void> {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('motoshine_token');
    const res = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || 'Xóa dịch vụ thất bại.');
    }
  },
};
