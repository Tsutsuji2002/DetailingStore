import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { MechanicDoc } from '@/types';
import mechanicDocsApi, { CreateMechanicDocPayload, UpdateMechanicDocPayload } from '@/services/api/mechanicDocsApi';

interface MechanicDocsState {
  items: MechanicDoc[];
  selectedDoc: MechanicDoc | null;
  loading: boolean;
  error: string | null;
}

const initialState: MechanicDocsState = {
  items: [],
  selectedDoc: null,
  loading: false,
  error: null,
};

export const fetchMechanicDocsThunk = createAsyncThunk(
  'mechanicDocs/fetchDocs',
  async (params: { search?: string; brand?: string; category?: string } | undefined, { rejectWithValue }) => {
    try {
      return await mechanicDocsApi.getDocs(params);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể tải danh sách tài liệu kỹ thuật.');
    }
  }
);

export const createMechanicDocThunk = createAsyncThunk(
  'mechanicDocs/createDoc',
  async (payload: CreateMechanicDocPayload, { rejectWithValue }) => {
    try {
      return await mechanicDocsApi.createDoc(payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Không thể tạo tài liệu kỹ thuật.');
    }
  }
);

export const updateMechanicDocThunk = createAsyncThunk(
  'mechanicDocs/updateDoc',
  async ({ id, payload }: { id: string; payload: UpdateMechanicDocPayload }, { rejectWithValue }) => {
    try {
      return await mechanicDocsApi.updateDoc(id, payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Không thể cập nhật tài liệu kỹ thuật.');
    }
  }
);

export const deleteMechanicDocThunk = createAsyncThunk(
  'mechanicDocs/deleteDoc',
  async (id: string, { rejectWithValue }) => {
    try {
      await mechanicDocsApi.deleteDoc(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Không thể xóa tài liệu kỹ thuật.');
    }
  }
);

const mechanicDocsSlice = createSlice({
  name: 'mechanicDocs',
  initialState,
  reducers: {
    setSelectedDoc(state, action: PayloadAction<MechanicDoc | null>) {
      state.selectedDoc = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchMechanicDocsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMechanicDocsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMechanicDocsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createMechanicDocThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update
      .addCase(updateMechanicDocThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteMechanicDocThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { setSelectedDoc, clearError } = mechanicDocsSlice.actions;
export default mechanicDocsSlice.reducer;
