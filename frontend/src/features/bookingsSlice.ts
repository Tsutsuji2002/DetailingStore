import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ServiceBooking } from '@/types';
import { bookingsApi } from '@/services/api/bookingsApi';

interface BookingsState {
  items: ServiceBooking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchBookingsThunk = createAsyncThunk(
  'bookings/fetchBookings',
  async (params: { date?: string; staffId?: string; status?: string } | undefined, { rejectWithValue }) => {
    try {
      return await bookingsApi.getBookings(params);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi tải lịch xe.');
    }
  }
);

export const createBookingThunk = createAsyncThunk(
  'bookings/createBooking',
  async (data: Partial<ServiceBooking>, { dispatch, rejectWithValue }) => {
    try {
      const res = await bookingsApi.createBooking(data);
      dispatch(fetchBookingsThunk());
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi tạo lịch xe.');
    }
  }
);

export const updateBookingThunk = createAsyncThunk(
  'bookings/updateBooking',
  async ({ id, data }: { id: string; data: Partial<ServiceBooking> }, { dispatch, rejectWithValue }) => {
    try {
      const res = await bookingsApi.updateBooking(id, data);
      dispatch(fetchBookingsThunk());
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi cập nhật lịch xe.');
    }
  }
);

export const updateBookingStatusThunk = createAsyncThunk(
  'bookings/updateBookingStatus',
  async ({ id, status }: { id: string; status: string }, { dispatch, rejectWithValue }) => {
    try {
      const res = await bookingsApi.updateBookingStatus(id, status);
      dispatch(fetchBookingsThunk());
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi cập nhật trạng thái.');
    }
  }
);

export const deleteBookingThunk = createAsyncThunk(
  'bookings/deleteBooking',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      const res = await bookingsApi.deleteBooking(id);
      dispatch(fetchBookingsThunk());
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi khi xóa lịch xe.');
    }
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookingsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBookingsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default bookingsSlice.reducer;
