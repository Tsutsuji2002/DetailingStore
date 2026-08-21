import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types';
import {
  authApi,
  RegisterRequest,
  LoginRequest,
  GoogleAuthRequest,
  SetCredentialsRequest,
  ChangePasswordOtpRequest
} from '@/services/api/authApi';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  linkingRequired: { email: string; credential: string } | null;
}

const storedUser = localStorage.getItem('motoshine_user');
const storedToken = localStorage.getItem('motoshine_token') || localStorage.getItem('auth_token');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,
  linkingRequired: null,
};

// Async Thunks
export const registerThunk = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const res = await authApi.register(data);
      return res;
    } catch (err: any) {
      const message = err.message || 'Đăng ký thất bại.';
      return rejectWithValue(message);
    }
  }
);

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (data: LoginRequest, { rejectWithValue }) => {
    try {
      const res = await authApi.login(data);
      return res;
    } catch (err: any) {
      const message = err.message || 'Đăng nhập thất bại.';
      return rejectWithValue(message);
    }
  }
);

export const googleAuthThunk = createAsyncThunk(
  'auth/google',
  async (payload: GoogleAuthRequest, { rejectWithValue }) => {
    try {
      const res = await authApi.googleAuth(payload);
      return { res, payload };
    } catch (err: any) {
      const message = err.message || 'Đăng nhập bằng Google thất bại.';
      return rejectWithValue(message);
    }
  }
);

export const setCredentialsThunk = createAsyncThunk(
  'auth/setCredentials',
  async (data: SetCredentialsRequest, { rejectWithValue }) => {
    try {
      const res = await authApi.setCredentials(data);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Cài đặt tên đăng nhập & mật khẩu thất bại.');
    }
  }
);

export const sendOtpThunk = createAsyncThunk(
  'auth/sendOtp',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.sendOtp();
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Gửi mã OTP thất bại.');
    }
  }
);

export const changePasswordOtpThunk = createAsyncThunk(
  'auth/changePasswordOtp',
  async (data: ChangePasswordOtpRequest, { rejectWithValue }) => {
    try {
      const res = await authApi.changePasswordOtp(data);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Xác thực OTP & Đổi mật khẩu thất bại.');
    }
  }
);

export const fetchCurrentUserThunk = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authApi.getCurrentUser();
      return user;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Phiên đăng nhập hết hạn.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.linkingRequired = null;
      localStorage.removeItem('motoshine_user');
      localStorage.removeItem('motoshine_token');
      localStorage.removeItem('auth_token');
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('motoshine_user', JSON.stringify(state.user));
      }
    },
    clearAuthError(state) {
      state.error = null;
    },
    clearLinkingRequired(state) {
      state.linkingRequired = null;
    }
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload.user && action.payload.token) {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('motoshine_user', JSON.stringify(action.payload.user));
        localStorage.setItem('motoshine_token', action.payload.token);
        localStorage.setItem('auth_token', action.payload.token);
      }
    });
    builder.addCase(registerThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Login
    builder.addCase(loginThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload.user && action.payload.token) {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('motoshine_user', JSON.stringify(action.payload.user));
        localStorage.setItem('motoshine_token', action.payload.token);
        localStorage.setItem('auth_token', action.payload.token);
      }
    });
    builder.addCase(loginThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Google Auth
    builder.addCase(googleAuthThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(googleAuthThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      const { res, payload } = action.payload;

      if (res.requiresLinking && res.email) {
        state.linkingRequired = { email: res.email, credential: payload.credential };
      } else if (res.user && res.token) {
        state.linkingRequired = null;
        state.user = res.user;
        state.token = res.token;
        state.isAuthenticated = true;
        localStorage.setItem('motoshine_user', JSON.stringify(res.user));
        localStorage.setItem('motoshine_token', res.token);
        localStorage.setItem('auth_token', res.token);
      }
    });
    builder.addCase(googleAuthThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Set Credentials
    builder.addCase(setCredentialsThunk.fulfilled, (state, action) => {
      if (action.payload.user) {
        state.user = action.payload.user;
        localStorage.setItem('motoshine_user', JSON.stringify(action.payload.user));
      }
    });

    // Change Password OTP
    builder.addCase(changePasswordOtpThunk.fulfilled, (state, action) => {
      if (action.payload.user) {
        state.user = action.payload.user;
        localStorage.setItem('motoshine_user', JSON.stringify(action.payload.user));
      }
    });

    // Fetch Current User
    builder.addCase(fetchCurrentUserThunk.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('motoshine_user', JSON.stringify(action.payload));
    });
  },
});

export const { logout, updateUser, clearAuthError, clearLinkingRequired } = authSlice.actions;
export default authSlice.reducer;
