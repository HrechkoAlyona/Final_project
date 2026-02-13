// frontend\src\pages\Messages\ChatWindow.jsx
// frontend/src/pages/Messages/ChatWindow.jsx

import React, { useRef, useLayoutEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { BiTrash, BiArrowBack } from "react-icons/bi"; // 🔥 Импорт стрелки назад
import {
  useGetChatHistoryQuery,
  useSendMessageMutation,
  useDeleteMessageMutation,
} from "../../services/chatApi";
import s from "./Messages.module.scss";
import MessageInput from "./MessageInput";

// 🔥 Принимаем prop onBack
const ChatWindow = ({ targetUser, myUser, onBack }) => {
  const navigate = useNavigate();
  const { data: messages = [], isLoading } = useGetChatHistoryQuery(targetUser._id);

  const [sendMessage] = useSendMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  const messagesEndRef = useRef(null);

  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  const handleSend = async (messageText) => {
    try {
      await sendMessage({
        recipientId: targetUser._id,
        text: messageText,
      }).unwrap();
    } catch (error) {
      console.error("Failed to send:", error);
    }
  };

  const handleDelete = async (msgId) => {
    if (window.confirm("Delete this message?")) {
      try {
        await deleteMessage(msgId).unwrap();
      } catch (error) {
        console.error("Failed to delete:", error);
      }
    }
  };

  const goToProfile = (userId) => {
    if (userId) navigate(`/profile/${userId}`);
  };

  if (isLoading) return <div className={s.chatArea}>Loading chat...</div>;

  return (
    <>
      <header className={s.chatHeader}>
        {/* 🔥 КНОПКА НАЗАД (Видна только на мобильном через CSS) */}
        <button className={s.backBtn} onClick={onBack}>
             <BiArrowBack />
        </button>

        <div
          className={s.headerUserInfo}
          onClick={() => goToProfile(targetUser._id)}
        >
          <img
            src={
              targetUser.avatar ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            className={s.headerAvatar}
            alt="user"
          />
          <span className={s.headerUsername}>{targetUser.username}</span>
        </div>
      </header>

      <div className={s.messagesList}>
        <div className={s.profileSummary}>
          <img
            src={
              targetUser.avatar ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            className={s.bigAvatar}
            alt="big"
            onClick={() => goToProfile(targetUser._id)}
          />
          <div
            className={s.bigUsername}
            onClick={() => goToProfile(targetUser._id)}
          >
            {targetUser.username}
          </div>
          <div className={s.subText}>
            {targetUser.fullName || targetUser.username} · ICHgram
          </div>
          <button
            className={s.viewProfileBtn}
            onClick={() => goToProfile(targetUser._id)}
          >
            View profile
          </button>
        </div>

        {messages.map((msg, index) => {
          const senderId =
            typeof msg.sender === "object" ? msg.sender._id : msg.sender;
          const myId = myUser?._id || myUser;
          const isMe = String(senderId) === String(myId);

          return (
            <div
              key={msg._id || index}
              className={`${s.messageBubble} ${isMe ? s.own : s.incoming}`}
            >
              {!isMe && (
                <img
                  src={
                    targetUser.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  className={s.bubbleAvatar}
                  alt="u"
                  onClick={() => goToProfile(targetUser._id)}
                />
              )}

              <div className={s.bubbleContent}>
                <div className={s.bubble}>
                  {msg.text}
                  <div className={s.time}>
                    {msg.createdAt &&
                      new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </div>
                </div>

                {isMe && (
                  <button
                    className={s.deleteBtn}
                    onClick={() => handleDelete(msg._id)}
                  >
                    <BiTrash size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className={s.inputArea}>
        <MessageInput onSendMessage={handleSend} />
      </div>
    </>
  );
};

export default ChatWindow;