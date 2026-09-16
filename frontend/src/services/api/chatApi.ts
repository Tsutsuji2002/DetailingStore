import type { ChatChannel, ChatMessage } from '@/types';

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

export const chatApi = {
  getChannels: async (userId?: string): Promise<ChatChannel[]> => {
    const query = userId ? `?userId=${userId}` : '';
    return request<ChatChannel[]>(`/chat/channels${query}`);
  },

  getChannelMessages: async (channelId: string): Promise<ChatMessage[]> => {
    return request<ChatMessage[]>(`/chat/channels/${channelId}/messages`);
  },

  sendMessage: async (dto: {
    channelId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    senderRole?: string;
    content: string;
  }): Promise<ChatMessage> => {
    return request<ChatMessage>('/chat/messages', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  createChannel: async (dto: {
    name: string;
    description?: string;
    creatorId?: string;
    memberIds?: string[];
  }): Promise<ChatChannel> => {
    return request<ChatChannel>('/chat/channels', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  getOrCreateDirectChannel: async (dto: {
    userId1: string;
    userId2: string;
  }): Promise<ChatChannel> => {
    return request<ChatChannel>('/chat/direct', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
};
