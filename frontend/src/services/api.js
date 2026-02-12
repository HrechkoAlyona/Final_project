// frontend\src\services\api.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { io } from 'socket.io-client';

let socket;

// --- НАСТРОЙКА СОКЕТА ---
export function getSocket() {
  if (!socket) {
    socket = io('http://127.0.0.1:5005', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

// --- ОСНОВНОЙ API ---
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://127.0.0.1:5005/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  // 🔥 Все теги для синхронизации данных
  tagTypes: [
    'AuthCheck', 'Post', 'User', 'Profile', 'Message', 
    'Conversation', 'Notification', 'Following', 'Followers'
  ],

  endpoints: (builder) => ({

    // === АВТОРИЗАЦИЯ ===
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['AuthCheck', 'User', 'Profile', 'Post'],
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

    // === ПОЛЬЗОВАТЕЛИ ===
    
    // Получение данных о себе
    getMe: builder.query({
      query: () => '/users/profile',
      keepUnusedDataFor: 0,
      providesTags: ['User'],
    }),

    getUserById: builder.query({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: 'Profile', id }, 'Profile'],
    }),

    updateProfile: builder.mutation({
      query: (userData) => ({
        url: '/users/profile',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),

    // Мутация подписки (Синхронизировано с бэкендом)
    followUser: builder.mutation({
      query: (userId) => ({
        url: '/users/follow', // Исправленный путь
        method: 'POST',
        body: { followingId: userId },
      }),
      // Инвалидируем теги, чтобы всё обновилось мгновенно
      invalidatesTags: ['User', 'Profile', 'Followers', 'Following', 'Post'], 
    }),

    // Списки для модалки
    getFollowers: builder.query({
      query: (userId) => `/users/${userId}/followers`,
      providesTags: ['Followers'],
    }),

    getFollowing: builder.query({
      query: (userId) => `/users/${userId}/following`,
      providesTags: ['Following'],
    }),

    // === ПОИСК ===
    searchUsers: builder.query({
      query: (searchTerm) => `/search?q=${searchTerm}`,
      keepUnusedDataFor: 5,
    }),
    
    addToSearchHistory: builder.mutation({
      query: (targetUserId) => ({
          url: '/users/search',
          method: 'PUT',
          body: { targetUserId },
      }),
      invalidatesTags: ['User'],
    }),

    removeFromSearchHistory: builder.mutation({
      query: (targetUserId) => ({
          url: '/users/search/remove',
          method: 'PUT',
          body: { targetUserId },
      }),
      invalidatesTags: ['User'],
    }),

    clearSearchHistory: builder.mutation({
      query: () => ({
          url: '/users/search',
          method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // === ПОСТЫ ===
    getFollowedPosts: builder.query({
      query: (page = 1) => `/posts/followed?page=${page}`,
      providesTags: ['Post'], 
    }),

    getExplorePosts: builder.query({
      query: () => '/posts/explore',
      providesTags: ['Post'],
    }),

    getPosts: builder.query({
      query: (params) => {
        const userId = params?.userId;
        const page = params?.page || 1;
        const limit = params?.limit || 10;
        let url = `/posts?page=${page}&limit=${limit}`;
        if (userId) url += `&userId=${userId}`;
        return url;
      },
      providesTags: (result, error, arg) => 
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Post', id: _id })),
              'Post',
              { type: 'Profile', id: arg?.userId } 
            ]
          : ['Post'],
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
      invalidatesTags: ['Post', 'Profile', 'User'],
    }),

    deletePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post', 'Profile', 'User'],
    }),

    updatePost: builder.mutation({
      query: ({ id, body }) => ({
        url: `/posts/${id}`,
        method: 'PUT',
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Post', id }, 
        'Post', 
        'Profile', 
        'User'
      ],
    }),

    // === ЛАЙКИ И КОММЕНТАРИИ ===
    toggleLike: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Post', id }],
    }),

    addComment: builder.mutation({
      query: ({ postId, text }) => ({
        url: `/comments`,
        method: 'POST',
        body: { postId, text },
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'Post', id: postId }],
    }),

    deleteComment: builder.mutation({
      query: (commentId) => ({
        url: `/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'],
    }),

    toggleCommentLike: builder.mutation({
      query: (commentId) => ({
        url: `/comments/${commentId}/like`,
        method: 'PUT',
      }),
      invalidatesTags: ['Post'],
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
  useGetFollowersQuery,
  useGetFollowingQuery,
  useSearchUsersQuery, 
  useAddToSearchHistoryMutation, 
  useRemoveFromSearchHistoryMutation, 
  useClearSearchHistoryMutation, 
  useGetFollowedPostsQuery,
  useLazyGetFollowedPostsQuery, 
  useGetPostsQuery,
  useGetExplorePostsQuery,
  useGetMyPostsQuery,
  useGetPostByIdQuery, 
  useCreatePostMutation,
  useDeletePostMutation,
  useUpdatePostMutation,
  useToggleLikeMutation,
  useAddCommentMutation,
  useDeleteCommentMutation, 
  useToggleCommentLikeMutation
} = api;