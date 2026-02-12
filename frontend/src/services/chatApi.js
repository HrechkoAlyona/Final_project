// frontend/src/services/chatApi.js

import { api, getSocket } from './api';

export const chatApi = api.injectEndpoints({
    endpoints: (builder) => ({

        // 1. ПОЛУЧИТЬ СПИСОК ДИАЛОГОВ
        getMyConversations: builder.query({
            query: () => '/messages/conversations',
            providesTags: ['Conversation'],

            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                const socket = getSocket();
                try {
                    await cacheDataLoaded;

                    const listener = (newMessage) => {
                        const currentUserId = localStorage.getItem('userId');

                        updateCachedData((draft) => {
                            const sId = String(newMessage.sender?._id || newMessage.sender);
                            const rId = String(newMessage.receiver?._id || newMessage.receiver);
                            const myId = String(currentUserId);

                            const isMeSender = sId === myId;
                            const partnerId = isMeSender ? rId : sId;

                            const index = draft.findIndex(c => String(c._id) === partnerId);

                            if (index !== -1) {
                                const conversation = draft[index];
                                conversation.lastMessage = newMessage.text;
                                conversation.updatedAt = newMessage.createdAt || new Date().toISOString();
                                conversation.isSender = isMeSender;
                                if (!isMeSender) {
                                    conversation.unreadCount = (conversation.unreadCount || 0) + 1;
                                }
                                draft.splice(index, 1);
                                draft.unshift(conversation);
                            } else {
                                const partnerData = isMeSender ? newMessage.receiver : newMessage.sender;
                                if (typeof partnerData === 'object') {
                                    draft.unshift({
                                        _id: partnerData._id,
                                        username: partnerData.username,
                                        avatar: partnerData.avatar,
                                        fullName: partnerData.fullName || '',
                                        lastMessage: newMessage.text,
                                        isSender: isMeSender,
                                        updatedAt: newMessage.createdAt || new Date().toISOString(),
                                        unreadCount: isMeSender ? 0 : 1
                                    });
                                }
                            }
                        });
                    };

                    socket.on('newMessage', listener);
                    await cacheEntryRemoved;
                    socket.off('newMessage', listener);
                } catch (err) { console.error(err); }
            }
        }),

        // 2. ИСТОРИЯ ЧАТА 
        getChatHistory: builder.query({
            query: (targetUserId) => `/messages/${targetUserId}`,
            providesTags: (result, error, id) => [{ type: 'Message', id }],

            async onCacheEntryAdded(targetUserId, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                const socket = getSocket();
                try {
                    await cacheDataLoaded;

                    // Слушатель НОВЫХ сообщений
                    const messageListener = (newMessage) => {
                        const sId = String(newMessage.sender?._id || newMessage.sender);
                        const rId = String(newMessage.receiver?._id || newMessage.receiver);
                        const tId = String(targetUserId);

                        if (sId === tId || rId === tId) {
                            updateCachedData((draft) => {
                                if (!draft.find(m => m._id === newMessage._id)) {
                                    draft.push(newMessage);
                                }
                            });
                        }
                    };

                    //  Слушатель УДАЛЕНИЯ сообщений
                    const deleteListener = (deletedMessageId) => {
                        updateCachedData((draft) => {
                            // Ищем сообщение в кэше и удаляем его
                            const index = draft.findIndex(m => m._id === deletedMessageId);
                            if (index !== -1) {
                                draft.splice(index, 1);
                            }
                        });
                    };

                    socket.on('newMessage', messageListener);
                    socket.on('message_deleted', deleteListener); // Подписались на удаление

                    await cacheEntryRemoved;

                    socket.off('newMessage', messageListener);
                    socket.off('message_deleted', deleteListener); // Отписались
                } catch (err) { console.error(err); }
            },
        }),

        // 3. ОТПРАВИТЬ СООБЩЕНИЕ 
        sendMessage: builder.mutation({
            query: ({ recipientId, text }) => ({
                url: '/messages',
                method: 'POST',
                body: { recipientId, text },
            }),
        }),

        // 4. СБРОСИТЬ СЧЕТЧИК
        markConversationAsRead: builder.mutation({
            query: (partnerId) => ({
                url: `/messages/read/${partnerId}`,
                method: 'PUT',
            }),
            async onQueryStarted(partnerId, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    chatApi.util.updateQueryData('getMyConversations', undefined, (draft) => {
                        const conversation = draft.find(c => String(c._id) === String(partnerId));
                        if (conversation) {
                            conversation.unreadCount = 0;
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),

        // 5. УДАЛИТЬ СООБЩЕНИЕ 
        deleteMessage: builder.mutation({
            query: (messageId) => ({
                url: `/messages/${messageId}`,
                method: 'DELETE',
            }),

        }),

    }),
});

export const {
    useGetMyConversationsQuery,
    useGetChatHistoryQuery,
    useSendMessageMutation,
    useMarkConversationAsReadMutation,
    useDeleteMessageMutation
} = chatApi;