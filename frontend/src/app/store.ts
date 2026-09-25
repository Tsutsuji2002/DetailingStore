import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/authSlice';
import themeReducer from '@/features/themeSlice';
import cartReducer from '@/features/cartSlice';
import servicesReducer from '@/features/servicesSlice';
import productsReducer from '@/features/productsSlice';
import postsReducer from '@/features/postsSlice';
import notificationsReducer from '@/features/notificationsSlice';
import scheduleReducer from '@/features/scheduleSlice';
import chatReducer from '@/features/chatSlice';
import shopReducer from '@/features/shopSlice';
import jobsReducer from '@/features/jobsSlice';
import workShiftsReducer from '@/features/workShiftsSlice';
import usersReducer from '@/features/usersSlice';
import mechanicDocsReducer from '@/features/mechanicDocsSlice';
import bookingsReducer from '@/features/bookingsSlice';
import serviceRequestsReducer from '@/features/serviceRequestsSlice';
import workOrdersReducer from '@/features/workOrdersSlice';
import paymentReducer from '@/features/paymentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    cart: cartReducer,
    services: servicesReducer,
    products: productsReducer,
    posts: postsReducer,
    notifications: notificationsReducer,
    schedule: scheduleReducer,
    chat: chatReducer,
    shop: shopReducer,
    jobs: jobsReducer,
    workShifts: workShiftsReducer,
    users: usersReducer,
    mechanicDocs: mechanicDocsReducer,
    bookings: bookingsReducer,
    serviceRequests: serviceRequestsReducer,
    workOrders: workOrdersReducer,
    payment: paymentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
