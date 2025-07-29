import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import adminSlice from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    admin: adminSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;