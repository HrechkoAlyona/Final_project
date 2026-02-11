// frontend\src\services\notificationsApi.js

import { api, getSocket } from './api';

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification'],

      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        const socket = getSocket();
        let listener; // Объявляем ЗА пределами блока try

        try {
          await cacheDataLoaded;

          listener = (newNotif) => {
            //  ЛОГ 1: Проверяем, прилетело ли что-то по сокету
            console.log("🔥 СОКЕТ СРАБОТАЛ! Пришло уведомление:", newNotif);
            
            updateCachedData((draft) => {
              const exists = draft.find(n => n._id === newNotif._id);
              if (!exists) {
                draft.unshift(newNotif);
              }
            });
          };

          socket.on('new_notification', listener);
          console.log("🎧 Подписка на уведомления активирована!"); //  ЛОГ 2

        } catch (err) {
          console.error("Ошибка в onCacheEntryAdded:", err);
        }

        await cacheEntryRemoved;
        if (listener) {
          socket.off('new_notification', listener);
        }
      },
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
  useGetNotificationsQuery, 
  useMarkNotificationsReadMutation 
} = notificationsApi;