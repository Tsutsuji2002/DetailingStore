const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5080/api';

export interface SiteContentDto {
  id: number;
  shopName: string;
  tagline: string;
  logoUrl?: string | null;
  logoIcon?: string | null;
  heroSlidesJson: string;
  updatedAt?: string;
}

export interface UpdateContentRequest {
  shopName: string;
  tagline: string;
  logoUrl?: string | null;
  logoIcon?: string | null;
  heroSlidesJson: string;
}

export interface HeroSlideDto {
  id: number;
  tag: string;
  title: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  linkType?: string;        // "none" | "service" | "post" | "product"
  linkedContentId?: string | null;
  linkedContentSlug?: string | null;
}

export const contentApi = {
  async getContent(): Promise<SiteContentDto> {
    const res = await fetch(`${API_BASE_URL}/content`);
    if (!res.ok) {
      throw new Error('Không thể tải thông tin trang web.');
    }
    return res.json();
  },

  async getSlides(): Promise<HeroSlideDto[]> {
    const res = await fetch(`${API_BASE_URL}/content/slides`);
    if (!res.ok) {
      throw new Error('Không thể tải danh sách hero slides.');
    }
    const result = await res.json();
    return result.data || result;
  },

  async updateContent(data: UpdateContentRequest): Promise<{ message: string; content: SiteContentDto }> {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('motoshine_token');
    const res = await fetch(`${API_BASE_URL}/content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.message || 'Cập nhật nội dung website thất bại.');
    }
    return result;
  },

  async uploadImage(file: File): Promise<{ message: string; url: string }> {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('motoshine_token');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/content/upload`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.message || 'Tải hình ảnh lên server thất bại.');
    }

    // Return full URL if relative
    const SERVER_HOST = 'http://localhost:5080';
    const fullUrl = result.url.startsWith('/') ? `${SERVER_HOST}${result.url}` : result.url;
    return { message: result.message, url: fullUrl };
  },
};
