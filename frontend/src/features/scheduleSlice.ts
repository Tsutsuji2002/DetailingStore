import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ScheduleShift } from '@/types';

interface ScheduleState {
  shifts: ScheduleShift[];
  selectedDate: string;
}

const initialState: ScheduleState = {
  shifts: [],
  selectedDate: new Date().toISOString().split('T')[0],
};

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    setSelectedDate(state, action: PayloadAction<string>) { state.selectedDate = action.payload; },
    addShift(state, action: PayloadAction<ScheduleShift>) { state.shifts.push(action.payload); },
    updateShift(state, action: PayloadAction<ScheduleShift>) {
      const idx = state.shifts.findIndex(s => s.id === action.payload.id);
      if (idx !== -1) state.shifts[idx] = action.payload;
    },
    deleteShift(state, action: PayloadAction<string>) {
      state.shifts = state.shifts.filter(s => s.id !== action.payload);
    },
  },
});

export const { setSelectedDate, addShift, updateShift, deleteShift } = scheduleSlice.actions;
export default scheduleSlice.reducer;
