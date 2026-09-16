const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5080/api';

export interface BackendProductCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface BackendProduct {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  brand?: string;
  shortDescription: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
}

export const productApi = {
  async getProducts(params?: { categoryId?: string; search?: string; sortBy?: string }): Promise<BackendProduct[]> {
    const query = new URLSearchParams();
    if (params?.categoryId && params.categoryId !== 'all') query.append('categoryId', params.categoryId);
    if (params?.search) query.append('search', params.search);
    if (params?.sortBy) query.append('sortBy', params.sortBy);

    const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`);
    if (!res.ok) {
      throw new Error('Không thể tải danh sách sản phẩm từ máy chủ.');
    }
    const json = await res.json();
    return json.data || [];
  },

  async getCategories(): Promise<BackendProductCategory[]> {
    const res = await fetch(`${API_BASE_URL}/products/categories`);
    if (!res.ok) {
      throw new Error('Không thể tải danh mục sản phẩm từ máy chủ.');
    }
    const json = await res.json();
    return json.data || [];
  },

  async createCategory(data: { name: string; slug?: string; icon?: string }): Promise<BackendProductCategory> {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('motoshine_token');
    const res = await fetch(`${API_BASE_URL}/products/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || 'Tạo danh mục sản phẩm thất bại.');
    }
    return json.data;
  },

  async deleteCategory(id: string): Promise<void> {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('motoshine_token');
    const res = await fetch(`${API_BASE_URL}/products/categories/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || 'Xóa danh mục sản phẩm thất bại.');
    }
  },

  async getProductByIdOrSlug(idOrSlug: string): Promise<BackendProduct> {
    const res = await fetch(`${API_BASE_URL}/products/${idOrSlug}`);
    if (!res.ok) {
      throw new Error('Không tìm thấy chi tiết sản phẩm.');
    }
    const json = await res.json();
    return json.data;
  },

  async createProduct(data: any): Promise<BackendProduct> {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('motoshine_token');
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || 'Tạo sản phẩm mới thất bại.');
    }
    return json.data;
  },

  async updateProduct(id: string, data: any): Promise<BackendProduct> {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('motoshine_token');
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || 'Cập nhật sản phẩm thất bại.');
    }
    return json.data;
  },

  async deleteProduct(id: string): Promise<void> {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('motoshine_token');
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || 'Xóa sản phẩm thất bại.');
    }
  },
};
