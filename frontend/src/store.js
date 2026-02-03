import { configureStore } from '@reduxjs/toolkit';
import { api } from './services/api'; 

export const store = configureStore({
  reducer: {
    // Добавляем API сервис в хранилище
    [api.reducerPath]: api.reducer,
  },
  // Добавляем мидлвар для работы кэширования и других фишек RTK Query
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});