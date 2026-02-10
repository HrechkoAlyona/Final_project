// frontend\src\pages\Messages\ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetChatHistoryQuery, useSendMessageMutation } from '../../services/chatApi';
import s from './Messages.module.scss';
import { format } from 'date-fns'; 

const ChatWindow = ({ targetUser, myUser }) => {
  const navigate = useNavigate();
  const { data: messages = [], isLoading } = useGetChatHistoryQuery(targetUser._id);
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await sendMessage({ 
          recipientId: targetUser._id, 
          text: text 
      }).unwrap();
      
      setText('');
    } catch (error) {
      console.error('Failed to send:', error);
    }
  };

  const goToProfile = (userId) => {
    if (userId) {
        navigate(`/profile/${userId}`);
    }
  };

  if (isLoading) return <div className={s.chatArea}>Loading chat...</div>;

  return (
    <>
      <header className={s.chatHeader}>
        <div 
            className={s.headerUserInfo} 
            onClick={() => goToProfile(targetUser._id)} 
        >
            <img 
              src={targetUser.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
              className={s.headerAvatar} 
              alt="user" 
            />
            <span className={s.headerUsername}>{targetUser.username}</span>
        </div>
      </header>

      <div className={s.messagesList}>
        
        <div className={s.profileSummary}>
           <img 
               src={targetUser.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
               className={s.bigAvatar} 
               alt="big" 
               onClick={() => goToProfile(targetUser._id)} 
           />
           <div className={s.bigUsername} onClick={() => goToProfile(targetUser._id)}>
               {targetUser.username}
           </div>
           <div className={s.subText}>{targetUser.fullName || targetUser.username} · Instagram</div>
           
           <button 
               className={s.viewProfileBtn} 
               onClick={() => goToProfile(targetUser._id)} 
           >
               View profile
           </button>
        </div>

        {messages.map((msg, index) => {
          const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
          const myId = myUser?._id || myUser;
          const isMe = String(senderId) === String(myId);
          
          return (
            <div key={index} className={`${s.messageBubble} ${isMe ? s.own : s.incoming}`}>
              
              {/* Аватарка СОБЕСЕДНИКА (Слева) */}
              {!isMe && (
                <img 
                  src={targetUser.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                  className={s.bubbleAvatar} 
                  alt="u"
                  onClick={() => goToProfile(targetUser._id)} 
                />
              )}
              
              {/* Текст + Время */}
              <div className={s.bubble}>
                {msg.text}
                <div className={s.time}>
                  {msg.createdAt && format(new Date(msg.createdAt), 'HH:mm')}
                </div>
              </div>

              {/* МОЯ Аватарка (Справа) */}
              {isMe && (
                <img 
                  src={myUser?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                  className={s.bubbleAvatar} 
                  alt="me"
                  onClick={() => goToProfile(myId)} 
                />
              )}

            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className={s.inputArea}>
        <form onSubmit={handleSend} className={s.inputWrapper}>
          <input 
            type="text" 
            placeholder="Message..." 
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSending}
          />
          {text.trim() && (
              <button type="submit" disabled={isSending}>
                Send
              </button>
          )}
        </form>
      </div>
    </>
  );
};

export default ChatWindow;