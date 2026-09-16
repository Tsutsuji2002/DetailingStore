const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5080/api';
const SERVER_BASE = API_BASE_URL.replace(/\/api\/?$/, '');

export interface PostDto {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  mediaType: 'image' | 'video' | 'text';
  tags: string[];
  likes: number;
  likedUserIds?: string[];
  isLikedByCurrentUser?: boolean;
  commentCount: number;
  isPublished: boolean;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
}

export interface CreatePostDto {
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  mediaType?: string;
  tags?: string[];
  isPublished: boolean;
  authorName?: string;
}

export const getClientId = (): string => {
  let cid = localStorage.getItem('device_client_id');
  if (!cid) {
    cid = 'client_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    localStorage.setItem('device_client_id', cid);
  }
  return cid;
};

const postApi = {
  getPosts: async (params?: { search?: string; tag?: string }): Promise<PostDto[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.tag) query.set('tag', params.tag);
    const qs = query.toString();
    const clientId = getClientId();
    const res = await fetch(`${API_BASE_URL}/posts${qs ? '?' + qs : ''}`, {
      headers: {
        'X-Client-Id': clientId
      }
    });
    if (!res.ok) throw new Error('Failed to fetch posts');
    const data = await res.json();
    return data.data ?? [];
  },

  getPost: async (idOrSlug: string): Promise<PostDto> => {
    const clientId = getClientId();
    const res = await fetch(`${API_BASE_URL}/posts/${idOrSlug}`, {
      headers: {
        'X-Client-Id': clientId
      }
    });
    if (!res.ok) throw new Error('Post not found');
    const data = await res.json();
    return data.data;
  },

  createPost: async (dto: CreatePostDto): Promise<PostDto> => {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create post');
    }
    const data = await res.json();
    return data.data;
  },

  updatePost: async (id: string, dto: CreatePostDto): Promise<PostDto> => {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update post');
    }
    const data = await res.json();
    return data.data;
  },

  deletePost: async (id: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) throw new Error('Failed to delete post');
  },

  likePost: async (id: string): Promise<{ likes: number; isLiked: boolean; likedUserIds: string[] }> => {
    const token = localStorage.getItem('auth_token');
    const clientId = getClientId();
    const res = await fetch(`${API_BASE_URL}/posts/${id}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': clientId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Failed to like post');
    return await res.json();
  },

  uploadImage: async (file: File): Promise<string> => {
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/content/upload`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload image');
    const data = await res.json();
    return `${SERVER_BASE}${data.url}`;
  },
};

export default postApi;

