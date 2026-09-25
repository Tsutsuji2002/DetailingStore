import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PaymentData {
  transactionId: string;
  requestId: string;
  orderId: string;
  paymentUrl: string;
  qrCodeUrl: string;
  amount: number;
}

export type PaymentStatus = 'idle' | 'initiating' | 'polling' | 'success' | 'failed';

interface PaymentState {
  currentPayment: PaymentData | null;
  status: PaymentStatus;
  error: string | null;
  pollingIntervalId: number | null;
}

const initialState: PaymentState = {
  currentPayment: null,
  status: 'idle',
  error: null,
  pollingIntervalId: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setCurrentPayment: (state, action: PayloadAction<PaymentData>) => {
      state.currentPayment = action.payload;
      state.error = null;
    },
    setPaymentStatus: (state, action: PayloadAction<PaymentStatus>) => {
      state.status = action.payload;
    },
    setPollingInterval: (state, action: PayloadAction<number | null>) => {
      state.pollingIntervalId = action.payload;
    },
    setPaymentError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.status = 'failed';
    },
    clearPayment: (state) => {
      state.currentPayment = null;
      state.status = 'idle';
      state.error = null;
      if (state.pollingIntervalId !== null) {
        clearInterval(state.pollingIntervalId);
        state.pollingIntervalId = null;
      }
    },
  },
});

export const {
  setCurrentPayment,
  setPaymentStatus,
  setPollingInterval,
  setPaymentError,
  clearPayment,
} = paymentSlice.actions;

export default paymentSlice.reducer;
