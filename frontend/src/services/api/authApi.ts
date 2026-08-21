import type { User } from '@/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5080/api';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  user?: User;
  requiresLinking?: boolean;
  email?: string;
  message?: string;
}

export interface GoogleAuthRequest {
  credential: string;
  confirmLinking?: boolean;
  password?: string;
}

export interface ChangePasswordOtpRequest {
  otpCode: string;
  newPassword: string;
}

export interface SetCredentialsRequest {
  username: string;
  password: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
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

export const authApi = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async googleAuth(payload: GoogleAuthRequest): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async sendOtp(): Promise<{ message: string; otpCodeForDev?: string }> {
    return request<{ message: string; otpCodeForDev?: string }>('/auth/send-otp', {
      method: 'POST',
    });
  },

  async changePasswordOtp(data: ChangePasswordOtpRequest): Promise<{ message: string; user?: User }> {
    return request<{ message: string; user?: User }>('/auth/change-password-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async setCredentials(data: SetCredentialsRequest): Promise<{ message: string; user: User }> {
    return request<{ message: string; user: User }>('/auth/set-credentials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getCurrentUser(): Promise<User> {
    return request<User>('/auth/me', {
      method: 'GET',
    });
  },
};
