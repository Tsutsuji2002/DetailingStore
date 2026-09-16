import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '@/types';

interface NotificationsState {
  items: Notification[];
  isOpen: boolean;
}

const initialState: NotificationsState = {
  items: [],
  isOpen: false,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    toggleOpen(state) { state.isOpen = !state.isOpen; },
    closePanel(state) { state.isOpen = false; },
    markAsRead(state, action: PayloadAction<string>) {
      const n = state.items.find(n => n.id === action.payload);
      if (n) n.isRead = true;
    },
    markAllRead(state) { state.items.forEach(n => { n.isRead = true; }); },
    addNotification(state, action: PayloadAction<Notification>) {
      state.items.unshift(action.payload);
    },
  },
});

export const { toggleOpen, closePanel, markAsRead, markAllRead, addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
