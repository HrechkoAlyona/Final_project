// frontend\src\services\notificationsApi.js
import { api, getSocket } from './api';

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification'],

      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        const socket = getSocket();
        try {
          await cacheDataLoaded;

          const listener = (newNotif) => {
            console.log("🔔 Socket Notification received:", newNotif); // лог для проверки
            updateCachedData((draft) => {
              const exists = draft.find(n => n._id === newNotif._id);
              if (!exists) {
                draft.unshift(newNotif);
              }
            });
          };

          socket.on('new_notification', listener);

          await cacheEntryRemoved;
          socket.off('new_notification', listener);
        } catch (err) {
          console.error("Socket error in notifications:", err);
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