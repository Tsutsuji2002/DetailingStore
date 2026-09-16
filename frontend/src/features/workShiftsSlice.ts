import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { WorkShiftConfig, ScheduleShift } from '@/types';
import workShiftsApi from '@/services/api/workShiftsApi';

interface WorkShiftsState {
  configs: WorkShiftConfig[];
  shifts: ScheduleShift[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkShiftsState = {
  configs: [],
  shifts: [],
  isLoading: false,
  error: null,
};

// Async Thunks - Configs
export const fetchShiftConfigsThunk = createAsyncThunk(
  'workShifts/fetchConfigs',
  async (all: boolean | undefined, { rejectWithValue }) => {
    try {
      return await workShiftsApi.getConfigs(all);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi tải danh sách ca làm việc');
    }
  }
);

export const createShiftConfigThunk = createAsyncThunk(
  'workShifts/createConfig',
  async (payload: Partial<WorkShiftConfig>, { rejectWithValue }) => {
    try {
      return await workShiftsApi.createConfig(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi tạo ca làm việc');
    }
  }
);

export const updateShiftConfigThunk = createAsyncThunk(
  'workShifts/updateConfig',
  async ({ id, data }: { id: string; data: Partial<WorkShiftConfig> }, { rejectWithValue }) => {
    try {
      return await workShiftsApi.updateConfig(id, data);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi cập nhật ca làm việc');
    }
  }
);

export const deleteShiftConfigThunk = createAsyncThunk(
  'workShifts/deleteConfig',
  async (id: string, { rejectWithValue }) => {
    try {
      await workShiftsApi.deleteConfig(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi xóa ca làm việc');
    }
  }
);

// Async Thunks - Assigned Shifts
export const fetchAssignedShiftsThunk = createAsyncThunk(
  'workShifts/fetchAssignedShifts',
  async (params: { staffId?: string; date?: string } | undefined, { rejectWithValue }) => {
    try {
      return await workShiftsApi.getAssignedShifts(params);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi tải lịch phân ca');
    }
  }
);

export const assignShiftThunk = createAsyncThunk(
  'workShifts/assignShift',
  async (payload: { staffId: string; shiftTypeId: string; date: string; notes?: string }, { rejectWithValue }) => {
    try {
      return await workShiftsApi.assignShift(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi phân ca trực');
    }
  }
);

export const deleteAssignedShiftThunk = createAsyncThunk(
  'workShifts/deleteAssignedShift',
  async (id: string, { rejectWithValue }) => {
    try {
      await workShiftsApi.deleteAssignedShift(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi xóa ca trực');
    }
  }
);

const workShiftsSlice = createSlice({
  name: 'workShifts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Configs
      .addCase(fetchShiftConfigsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShiftConfigsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.configs = action.payload;
      })
      .addCase(fetchShiftConfigsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(createShiftConfigThunk.fulfilled, (state, action) => {
        state.configs.push(action.payload);
      })
      .addCase(updateShiftConfigThunk.fulfilled, (state, action) => {
        const idx = state.configs.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.configs[idx] = action.payload;
      })
      .addCase(deleteShiftConfigThunk.fulfilled, (state, action) => {
        state.configs = state.configs.filter((c) => c.id !== action.payload);
      })

      // Assigned Shifts
      .addCase(fetchAssignedShiftsThunk.fulfilled, (state, action) => {
        state.shifts = action.payload;
      })
      .addCase(assignShiftThunk.fulfilled, (state, action) => {
        state.shifts.unshift(action.payload);
      })
      .addCase(deleteAssignedShiftThunk.fulfilled, (state, action) => {
        state.shifts = state.shifts.filter((s) => s.id !== action.payload);
      });
  },
});

export default workShiftsSlice.reducer;
