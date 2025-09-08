import { configureStore } from '@reduxjs/toolkit';
import { APP_CONFIG } from '@constants';

// Import reducers
import authReducer from './slices/authSlice';
import tasksReducer from './slices/tasksSlice';
import bidsReducer from './slices/bidsSlice';
import paymentsReducer from './slices/paymentsSlice';
import toastReducer from '../services/toastService';

// Configure store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    bids: bidsReducer,
    payments: paymentsReducer,
    toast: toastReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    }),
  devTools: APP_CONFIG.ENABLE_REDUX_DEVTOOLS
});

// TypeScript types would go here if using TypeScript
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

export default store;
