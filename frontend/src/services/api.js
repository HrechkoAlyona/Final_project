// frontend\src\services\api.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { io } from 'socket.io-client'; 

// Функция получения сокета
let socket;
export function getSocket() {
  if (!socket) {
    socket = io('http://localhost:5005'); 
  }
  return socket;
}

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
  
  tagTypes: ['AuthCheck', 'Post', 'User', 'Profile', 'Message', 'Conversation', 'Notification'], 

  endpoints: (builder) => ({
    // --- АВТОРИЗАЦИЯ ---
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

    // --- ПОЛЬЗОВАТЕЛИ ---
    getMe: builder.query({
      query: () => '/users/profile',
      keepUnusedDataFor: 0,
      providesTags: ['User'],
    }),

    getUserById: builder.query({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: 'Profile', id }],
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
        url: '/follows', 
        method: 'POST',  
        body: { followingId: userId }, 
      }),
      invalidatesTags: (result, error, userId) => [
        'User', 
        'Post', 
        { type: 'Profile', id: userId }
      ], 
    }),

    getFollowers: builder.query({
      query: (userId) => `/users/${userId}/followers`,
      providesTags: ['Followers'],
    }),

    getFollowing: builder.query({
      query: (userId) => `/users/${userId}/following`,
      providesTags: ['Following'],
    }),

    // --- ПОИСК ---
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

// --- ПОСТЫ ---
    
    // Получение постов подписок
    getFollowedPosts: builder.query({
      query: (page = 1) => `/posts/followed?page=${page}`,
      providesTags: ['Post'],
    }),

    // Рекомендации (Explore)
    getExplorePosts: builder.query({
      query: () => '/posts/explore',
      providesTags: ['Post'],
    }),

    // Умный поиск постов (умеет фильтровать по userId для блока "More posts")
    getPosts: builder.query({
      query: (params) => {
        // params может быть объектом: { userId: '...', page: 1, limit: 10 }
        const userId = params?.userId;
        const page = params?.page || 1;
        const limit = params?.limit || 10;

        let url = `/posts?page=${page}&limit=${limit}`;
        if (userId) url += `&userId=${userId}`;
        
        return url;
      },
      providesTags: ['Post'],
    }),

    // Посты текущего пользователя
    getMyPosts: builder.query({
      query: () => '/posts/my',
      providesTags: ['Post'],
    }),

    // Получение одного поста по ID
    getPostById: builder.query({
      query: (postId) => `/posts/${postId}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),

    // Создание поста
    createPost: builder.mutation({
      query: (postData) => ({
        url: '/posts',
        method: 'POST',
        body: postData,
      }),
      invalidatesTags: ['Post', 'User'],
    }),

    // Удаление поста
    deletePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'Post'],
    }),

    // Обновление поста (поддерживает FormData для смены картинки)
    updatePost: builder.mutation({
      query: ({ id, body }) => ({ 
        url: `/posts/${id}`,
        method: 'PUT',
        body: body, 
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Post', id }, 'Post'], 
    }),

// --- ЛАЙКИ И КОММЕНТАРИИ ---
    toggleLike: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Post', id }, 'Post'],
    }),

    addComment: builder.mutation({
      query: ({ postId, text }) => ({
        url: `/comments`,  
        method: 'POST',
        body: { postId, text }, // Передаем postId в теле запроса
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'Post', id: postId }, 'Post'],
    }),

    //  ЭНДПОИНТ ДЛЯ ЛАЙКА КОММЕНТАРИЯ
    toggleCommentLike: builder.mutation({
      query: (commentId) => ({
        // Убедись, что путь совпадает с тем, что мы сделаем на бэкенде!
        url: `/comments/${commentId}/like`, 
        method: 'PUT',
      }),
      // Инвалидируем посты, чтобы комменты внутри них обновились и показали новое сердечко
      invalidatesTags: ['Post'], 
    }),

    // --- УВЕДОМЛЕНИЯ (НОВОЕ) ---
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification'], 
    }),

    markNotificationsRead: builder.mutation({
      query: () => ({
        url: '/notifications/read',
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
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
  useToggleCommentLikeMutation,
  useGetNotificationsQuery,
  useMarkNotificationsReadMutation
} = api;