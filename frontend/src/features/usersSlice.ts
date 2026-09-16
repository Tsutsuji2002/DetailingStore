import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { usersApi } from '@/services/api/usersApi';
import type { User } from '@/types';

interface UsersState {
  users: User[];
  staffUsers: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  staffUsers: [],
  isLoading: false,
  error: null,
};

export const fetchUsersThunk = createAsyncThunk(
  'users/fetchUsers',
  async (role: string | undefined, { rejectWithValue }) => {
    try {
      return await usersApi.getUsers(role);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi tải danh sách người dùng');
    }
  }
);

export const fetchStaffUsersThunk = createAsyncThunk(
  'users/fetchStaffUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await usersApi.getStaffUsers();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi tải danh sách nhân viên');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStaffUsersThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStaffUsersThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staffUsers = action.payload;
      })
      .addCase(fetchStaffUsersThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default usersSlice.reducer;
