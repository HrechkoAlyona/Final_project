// frontend\src\services\chatApi.js


import { api, getSocket } from './api';

export const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    
    // 1. Получить список диалогов
    getMyConversations: builder.query({
      query: () => '/messages/conversations',
      providesTags: ['Conversation'],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          const socket = getSocket(); 
          await cacheDataLoaded;

          const listener = (newMessage) => {
            updateCachedData((draft) => {
               const senderId = typeof newMessage.sender === 'object' ? newMessage.sender._id : newMessage.sender;
               const receiverId = typeof newMessage.receiver === 'object' ? newMessage.receiver._id : newMessage.receiver;
               
               // Ищем диалог
               const conversation = draft.find(c => c._id === senderId || c._id === receiverId);

               if (conversation) {
                 // Обновляем текст
                 conversation.lastMessage = newMessage.text;
    
                 draft.sort((a) => (a._id === conversation._id ? -1 : 1));
               }
            });
          };

          socket.on('newMessage', listener);

          await cacheEntryRemoved;
          socket.off('newMessage', listener);
        } catch {
           // ignore
        }
      }
    }),

    // 2. Получить историю переписки
    getChatHistory: builder.query({
      query: (targetUserId) => `/messages/${targetUserId}`,
      providesTags: (result, error, id) => [{ type: 'Message', id }],
      
      async onCacheEntryAdded(targetUserId, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          const socket = getSocket();
          await cacheDataLoaded;

          const listener = (newMessage) => {
            const senderId = typeof newMessage.sender === 'object' ? newMessage.sender._id : newMessage.sender;
            const receiverId = typeof newMessage.receiver === 'object' ? newMessage.receiver._id : newMessage.receiver;

            const isRelevant = 
              (String(senderId) === String(targetUserId)) || 
              (String(receiverId) === String(targetUserId));

            if (!isRelevant) return;

            updateCachedData((draft) => {
              const exists = draft.find(m => m._id === newMessage._id);
              if (!exists) {
                draft.push(newMessage);
              }
            });
          };

          socket.on('newMessage', listener);

          await cacheEntryRemoved;
          socket.off('newMessage', listener);
        } catch {
           // ignore
        }
      },
    }),

    // 3. Отправить сообщение
    sendMessage: builder.mutation({
      query: ({ recipientId, text }) => ({
        url: '/messages',
        method: 'POST',
        body: { recipientId, text },
      }),
      invalidatesTags: ['Conversation', 'Message'],
    }),
  }),
});

export const {
  useGetMyConversationsQuery,
  useGetChatHistoryQuery,
  useSendMessageMutation
} = chatApi;