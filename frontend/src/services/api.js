import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api', // Vite проксирует это на бэкенд http://localhost:5005
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['AuthCheck', 'Post', 'User'],
  endpoints: (builder) => ({
    // 1. Логин
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['AuthCheck'],
    }),

    // 2. Регистрация
    registerUser: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    // 3. Сброс пароля - Шаг 1 (Отправка кода)
    // Добавляем этот блок:
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    // 4. Сброс пароля - Шаг 2 (Смена пароля)
    // И этот блок:
    resetPasswordStep2: builder.mutation({
      query: (data) => ({
        url: '/auth/reset-password/step2',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

// Экспортируем хуки (RTK Query создает их автоматически на основе имен эндпоинтов)
export const { 
  useLoginMutation, 
  useRegisterUserMutation,
  useResetPasswordMutation,     
  useResetPasswordStep2Mutation  
} = api;