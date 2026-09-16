import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Job } from '@/types';
import jobsApi from '@/services/api/jobsApi';

interface JobsState {
  items: Job[];
  isLoading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  items: [],
  isLoading: false,
  error: null,
};

// Thunks
export const fetchJobsThunk = createAsyncThunk(
  'jobs/fetchAll',
  async (all: boolean | undefined, { rejectWithValue }) => {
    try { return await jobsApi.getAll(all); }
    catch (err: any) { return rejectWithValue(err.message); }
  }
);

export const createJobThunk = createAsyncThunk(
  'jobs/create',
  async (payload: Partial<Job>, { rejectWithValue }) => {
    try { return await jobsApi.create(payload); }
    catch (err: any) { return rejectWithValue(err.message); }
  }
);

export const updateJobThunk = createAsyncThunk(
  'jobs/update',
  async ({ id, data }: { id: string; data: Partial<Job> }, { rejectWithValue }) => {
    try { return await jobsApi.update(id, data); }
    catch (err: any) { return rejectWithValue(err.message); }
  }
);

export const deleteJobThunk = createAsyncThunk(
  'jobs/delete',
  async (id: string, { rejectWithValue }) => {
    try { await jobsApi.delete(id); return id; }
    catch (err: any) { return rejectWithValue(err.message); }
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobsThunk.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchJobsThunk.fulfilled, (state, action) => { state.isLoading = false; state.items = action.payload; })
      .addCase(fetchJobsThunk.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })

      .addCase(createJobThunk.fulfilled, (state, action) => { state.items.unshift(action.payload); })

      .addCase(updateJobThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex(j => j.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })

      .addCase(deleteJobThunk.fulfilled, (state, action) => {
        state.items = state.items.filter(j => j.id !== action.payload);
      });
  },
});

export default jobsSlice.reducer;
