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
  tagTypes: ['AuthCheck', 'Post', 'User', 'Profile'], 

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
    getFollowedPosts: builder.query({
      query: (page = 1) => `/posts/followed?page=${page}`,
      providesTags: ['Post'],
    }),

    getExplorePosts: builder.query({
      query: () => '/posts/explore',
      providesTags: ['Post'],
    }),

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
        body: { description: content, title }, 
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Post', id }], 
    }),

    // ЛАЙКИ

   toggleLike: builder.mutation({
  query: (postId) => ({
    url: `/posts/${postId}/like`,
    method: 'PUT',
  }),
  // Оставляем теги, чтобы после завершения запроса данные в фоне синхронизировались
  invalidatesTags: (result, error, id) => [{ type: 'Post', id }, 'Post'],
}),



    // --- КОММЕНТАРИИ ---
    addComment: builder.mutation({
      query: ({ postId, text }) => ({
        url: `/posts/${postId}/comment`, 
        method: 'POST',
        body: { text },
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'Post', id: postId }, 'Post'],
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
  useAddCommentMutation 
} = api;