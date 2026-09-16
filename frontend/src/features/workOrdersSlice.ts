import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  WorkOrderDto,
  WorkOrderDetailDto,
  WorkOrderStatus,
  AvailableStaffDto,
  CreateWorkOrderDto,
  UpdateWorkOrderStatusDto,
} from '@/types';
import { workOrderApi } from '@/services/api/workOrderApi';

interface WorkOrdersState {
  items: WorkOrderDto[];
  selectedItem: WorkOrderDetailDto | null;
  availableStaff: AvailableStaffDto[];
  loading: boolean;
  staffLoading: boolean;
  error: string | null;
}

const initialState: WorkOrdersState = {
  items: [],
  selectedItem: null,
  availableStaff: [],
  loading: false,
  staffLoading: false,
  error: null,
};

export const fetchWorkOrders = createAsyncThunk(
  'workOrders/fetchWorkOrders',
  async (
    params: { staffId?: string; status?: WorkOrderStatus; date?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      return await workOrderApi.getWorkOrders(params);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi tải danh sách công việc.');
    }
  }
);

export const fetchWorkOrderById = createAsyncThunk(
  'workOrders/fetchWorkOrderById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await workOrderApi.getWorkOrderById(id);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi tải chi tiết công việc.');
    }
  }
);

export const createWorkOrder = createAsyncThunk(
  'workOrders/createWorkOrder',
  async (data: CreateWorkOrderDto, { dispatch, rejectWithValue }) => {
    try {
      const res = await workOrderApi.createWorkOrder(data);
      dispatch(fetchWorkOrders());
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi tạo công việc.');
    }
  }
);

export const updateWorkOrderStatus = createAsyncThunk(
  'workOrders/updateWorkOrderStatus',
  async ({ id, data }: { id: string; data: UpdateWorkOrderStatusDto }, { rejectWithValue }) => {
    try {
      return await workOrderApi.updateWorkOrderStatus(id, data);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi cập nhật trạng thái công việc.');
    }
  }
);

export const fetchAvailableStaff = createAsyncThunk(
  'workOrders/fetchAvailableStaff',
  async ({ startTime, endTime }: { startTime: string; endTime: string }, { rejectWithValue }) => {
    try {
      return await workOrderApi.getAvailableStaff(startTime, endTime);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi tải danh sách nhân viên khả dụng.');
    }
  }
);

const workOrdersSlice = createSlice({
  name: 'workOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWorkOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchWorkOrderById.fulfilled, (state, action) => {
        state.selectedItem = action.payload;
      })
      .addCase(updateWorkOrderStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((item) => item.id === updated.id);
        if (idx !== -1) {
          state.items[idx] = updated;
        }
      })
      .addCase(fetchAvailableStaff.pending, (state) => {
        state.staffLoading = true;
      })
      .addCase(fetchAvailableStaff.fulfilled, (state, action) => {
        state.staffLoading = false;
        state.availableStaff = action.payload;
      })
      .addCase(fetchAvailableStaff.rejected, (state) => {
        state.staffLoading = false;
      });
  },
});

export default workOrdersSlice.reducer;
