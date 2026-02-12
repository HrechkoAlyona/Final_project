// frontend\src\pages\Messages\MessagesPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import s from "./Messages.module.scss";
import { AiOutlineEdit } from "react-icons/ai";

import {
  useGetMeQuery,
  useSearchUsersQuery,
  getSocket,
} from "../../services/api";

import {
  useGetMyConversationsQuery,
  useMarkConversationAsReadMutation,
} from "../../services/chatApi";

// Components
import ChatWindow from "./ChatWindow";
import { formatShortTime } from "../../utils/dateUtils";

const MessagesPage = () => {
  const { data: conversations = [], isLoading: isChatsLoading } =
    useGetMyConversationsQuery();
  const { data: myUser } = useGetMeQuery();

  // Хук для сброса счетчика
  const [markAsRead] = useMarkConversationAsReadMutation();

  // --- ЛОГИКА СОКЕТА (JOIN ROOM) ---
  useEffect(() => {
    if (myUser?._id) {
      const socket = getSocket();
      // Подключаемся к комнате, чтобы получать уведомления
      socket.emit("join", myUser._id);
    }
  }, [myUser]);
  // ----------------------------------

  const location = useLocation();
  const [selectedUser, setSelectedUser] = useState(
    location.state?.userToChat || null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: searchResults = [] } = useSearchUsersQuery(searchTerm, {
    skip: searchTerm.length < 2,
  });

  // 1. Обработчик клика из МОДАЛЬНОГО ОКНА (Поиск)
  const handleSelectUserFromSearch = (user) => {
    setSelectedUser(user);
    setIsModalOpen(false);
    setSearchTerm("");

    // Сбрасываем счетчик, если открыли диалог
    if (user?._id) markAsRead(user._id);
  };

  // 2. Обработчик клика из САЙДБАРА (Список диалогов)
  const handleChatClick = (chat) => {
    setSelectedUser(chat);

    // Сбрасываем счетчик, если открыли диалог
    if (chat?._id) markAsRead(chat._id);
  };

  if (isChatsLoading)
    return <div className={s.messagesPageContainer}>Loading...</div>;

  return (
    <div className={s.messagesPageContainer}>
      {/* ЛЕВАЯ КОЛОНКА */}
      <div className={s.conversationsList}>
        <div className={s.header}>
          <span>{myUser?.username || "Messages"}</span>
          <div
            className={s.newChatIcon}
            onClick={() => setIsModalOpen(true)}
            title="New Message"
          >
            <AiOutlineEdit size={24} />
          </div>
        </div>

        <div className={s.list}>
          {conversations.length === 0 && (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#888" }}
            >
              No messages yet.
            </div>
          )}

          {conversations.map((chat) => (
            <div
              key={chat._id}
              className={`${s.conversationItem} ${selectedUser?._id === chat._id ? s.active : ""}`}
              onClick={() => handleChatClick(chat)}
            >
              <img
                src={
                  chat.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="avatar"
                className={s.avatar}
              />

              <div className={s.info}>
                {/* Верхняя строка: Имя + Счетчик */}
                <div className={s.userRow}>
                  <span className={s.username}>{chat.username}</span>
                  {chat.unreadCount > 0 && (
                    <span className={s.unreadBadge}>{chat.unreadCount}</span>
                  )}
                </div>

                {/* Нижняя строка: Сообщение + Время */}
                <div className={s.messageRow}>
                  <span className={s.lastMessage}>
                    {chat.isSender && "You: "} {chat.lastMessage}
                  </span>
                  <span className={s.timeDot}>·</span>
                  <span className={s.timeVal}>
                    {formatShortTime(chat.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ПРАВАЯ КОЛОНКА */}
      <div className={s.chatWindow}>
        {selectedUser ? (
          <ChatWindow targetUser={selectedUser} myUser={myUser} />
        ) : (
          <div className={s.emptyState}>
            <div style={{ fontSize: "50px", marginBottom: "20px" }}>💬</div>
            <h2>Your Messages</h2>
            <p>Send private photos and messages to a friend.</p>
            <button
              className={s.sendMessageBtn}
              onClick={() => setIsModalOpen(true)}
            >
              Send message
            </button>
          </div>
        )}
      </div>

      {/* МОДАЛЬНОЕ ОКНО ПОИСКА */}
      {isModalOpen && (
        <div className={s.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <span
                onClick={() => setIsModalOpen(false)}
                style={{ cursor: "pointer" }}
              >
                Close
              </span>
              <span>New Message</span>
              <span style={{ color: "#0095f6", cursor: "pointer" }}>Next</span>
            </div>
            <div className={s.modalInput}>
              <span>To:</span>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <div className={s.searchResults}>
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className={s.userResult}
                  onClick={() => handleSelectUserFromSearch(user)}
                >
                  <img
                    src={
                      user.avatar ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt="u"
                  />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: "600" }}>{user.username}</span>
                    <span style={{ fontSize: "12px", color: "#737373" }}>
                      {user.fullName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
