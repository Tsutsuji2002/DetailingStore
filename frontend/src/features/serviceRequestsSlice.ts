import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  ServiceRequestDto,
  ServiceRequestDetailDto,
  ServiceRequestStatus,
  CreateServiceRequestDto,
  AcceptServiceRequestDto,
} from '@/types';
import { serviceRequestApi } from '@/services/api/serviceRequestApi';

interface ServiceRequestsState {
  items: ServiceRequestDto[];
  selectedItem: ServiceRequestDetailDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: ServiceRequestsState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
};

export const fetchServiceRequests = createAsyncThunk(
  'serviceRequests/fetchServiceRequests',
  async (params: { status?: ServiceRequestStatus } | undefined, { rejectWithValue }) => {
    try {
      return await serviceRequestApi.getServiceRequests(params);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi tải danh sách yêu cầu dịch vụ.');
    }
  }
);

export const fetchServiceRequestById = createAsyncThunk(
  'serviceRequests/fetchServiceRequestById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await serviceRequestApi.getServiceRequestById(id);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi tải chi tiết yêu cầu dịch vụ.');
    }
  }
);

export const createServiceRequest = createAsyncThunk(
  'serviceRequests/createServiceRequest',
  async (data: CreateServiceRequestDto, { dispatch, rejectWithValue }) => {
    try {
      const res = await serviceRequestApi.createServiceRequest(data);
      if (!res) {
        return rejectWithValue('Không nhận được phản hồi từ máy chủ. Vui lòng thử lại.');
      }
      dispatch(fetchServiceRequests());
      return res;
    } catch (err: any) {
      console.error('[createServiceRequest] API error:', err);
      return rejectWithValue(err.message || 'Lỗi khi tạo yêu cầu dịch vụ.');
    }
  }
);

export const acceptServiceRequest = createAsyncThunk(
  'serviceRequests/acceptServiceRequest',
  async ({ id, data }: { id: string; data: AcceptServiceRequestDto }, { dispatch, rejectWithValue }) => {
    try {
      const res = await serviceRequestApi.acceptServiceRequest(id, data);
      dispatch(fetchServiceRequests());
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi chấp nhận yêu cầu dịch vụ.');
    }
  }
);

export const rejectServiceRequest = createAsyncThunk(
  'serviceRequests/rejectServiceRequest',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      const res = await serviceRequestApi.rejectServiceRequest(id);
      dispatch(fetchServiceRequests());
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi từ chối yêu cầu dịch vụ.');
    }
  }
);

const serviceRequestsSlice = createSlice({
  name: 'serviceRequests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchServiceRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchServiceRequestById.fulfilled, (state, action) => {
        state.selectedItem = action.payload;
      });
  },
});

export default serviceRequestsSlice.reducer;
