// frontend/src/services/api.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5005/api', 
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
    
    // --- АВТОРИЗАЦИЯ ---
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['AuthCheck'],
    }),

    registerUser: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    resetPasswordStep2: builder.mutation({
      query: (data) => ({
        url: '/auth/reset-password/step2',
        method: 'POST',
        body: data,
      }),
    }),

    // --- ПОЛЬЗОВАТЕЛИ ---
    
    // Получить СВОЙ профиль (важно для истории поиска)
    getMe: builder.query({
      query: () => '/users/profile',
      // keepUnusedDataFor: 0 гарантирует, что мы всегда получим свежую историю при открытии
      keepUnusedDataFor: 0,
      providesTags: ['User'],
    }),

    getUserById: builder.query({
      query: (id) => `users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    updateProfile: builder.mutation({
      query: (userData) => ({
        url: '/users/profile',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    followUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}/follow`,
        method: 'PUT',
      }),
      invalidatesTags: ['User', 'Post'], 
    }),

    // --- ПОИСК И ИСТОРИЯ ---

    // 1. Живой поиск
    searchUsers: builder.query({
      query: (searchTerm) => `/search?q=${searchTerm}`,
      keepUnusedDataFor: 5, 
    }),

    // 2. Добавить в историю (при клике)
    addToSearchHistory: builder.mutation({
      query: (targetUserId) => ({
        url: '/users/search',
        method: 'PUT',
        body: { targetUserId },
      }),
      invalidatesTags: ['User'], // Обновит профиль и список Recent
    }),

    // 3. Удалить одного из истории
    removeFromSearchHistory: builder.mutation({
      query: (targetUserId) => ({
        url: '/users/search/remove',
        method: 'PUT',
        body: { targetUserId },
      }),
      invalidatesTags: ['User'],
    }),

    // 4. Очистить всё
    clearSearchHistory: builder.mutation({
      query: () => ({
        url: '/users/search',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),


    // --- ПОСТЫ ---

    getPosts: builder.query({
      query: () => '/posts',
      providesTags: ['Post'],
    }),

    getMyPosts: builder.query({
      query: () => '/posts/my',
      providesTags: ['Post'],
    }),

    getPostById: builder.query({
      query: (postId) => `/posts/${postId}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),

    createPost: builder.mutation({
      query: (postData) => ({
        url: '/posts',
        method: 'POST',
        body: postData,
      }),
      invalidatesTags: ['Post', 'User'],
    }),

    deletePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'Post'], 
    }),

    updatePost: builder.mutation({
      query: ({ id, content, title }) => ({ 
        url: `/posts/${id}`,
        method: 'PUT',
        body: { description: content, title: title }, 
      }),
      invalidatesTags: ['Post', 'User'], 
    }),

    toggleLike: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: 'PUT',
      }),
      invalidatesTags: ['Post'] 
    }),

  }),
});

export const { 
  useLoginMutation, 
  useRegisterUserMutation,
  useResetPasswordMutation,     
  useResetPasswordStep2Mutation,
  useGetUserByIdQuery,
  useGetMeQuery, 
  useUpdateProfileMutation,
  useFollowUserMutation,
  
  // Хуки поиска
  useSearchUsersQuery, 
  useAddToSearchHistoryMutation, 
  useRemoveFromSearchHistoryMutation, 
  useClearSearchHistoryMutation, 
  
  useGetPostsQuery,
  useGetMyPostsQuery,
  useGetPostByIdQuery, 
  useCreatePostMutation,
  useDeletePostMutation,
  useUpdatePostMutation,
  useToggleLikeMutation 
} = api;