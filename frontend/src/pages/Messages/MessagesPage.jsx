// frontend\src\pages\Messages\MessagesPage.jsx
import React, { useState } from 'react'; 
import { useLocation } from 'react-router-dom';
import s from './Messages.module.scss';

// Импорт иконки
import { AiOutlineEdit } from 'react-icons/ai'; 

// Импорты API
import { useGetMeQuery, useSearchUsersQuery } from '../../services/api'; 
import { useGetMyConversationsQuery } from '../../services/chatApi'; 

import ChatWindow from './ChatWindow'; 

const MessagesPage = () => {
  const { data: conversations = [], isLoading: isChatsLoading } = useGetMyConversationsQuery();
  const { data: myUser } = useGetMeQuery();

  // Хуки роутера
  const location = useLocation();

  // Мы берем пользователя сразу из location.state при создании переменной.
  // Если location.state.userToChat есть — берем его, иначе null.
  const [selectedUser, setSelectedUser] = useState(location.state?.userToChat || null);

  // --- useEffect с setSelectedUser БОЛЬШЕ НЕ НУЖЕН ---

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: searchResults = [] } = useSearchUsersQuery(searchTerm, {
    skip: searchTerm.length < 2, 
  });

  const handleSelectUser = (user) => {
    setSelectedUser(user); 
    setIsModalOpen(false); 
    setSearchTerm('');     
  };

  if (isChatsLoading) return <div className={s.messagesPageContainer}>Loading...</div>;

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
            <div style={{padding: '20px', textAlign: 'center', color: '#888'}}>
              No messages yet. Start a chat!
            </div>
          )}

          {conversations.map((chat) => (
            <div 
              key={chat._id} 
              className={`${s.conversationItem} ${selectedUser?._id === chat._id ? s.active : ''}`}
              onClick={() => setSelectedUser(chat)}
            >
              <img 
                src={chat.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                alt="avatar" 
                className={s.avatar} 
              />
              <div className={s.info}>
                <span className={s.username}>{chat.username}</span>
                <span className={s.lastMessage}>
                   {chat.isSender && "You: "} {chat.lastMessage}
                </span>
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
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>💬</div>
            <h2>Your Messages</h2>
            <p>Send private photos and messages to a friend.</p>
            <button className={s.sendMessageBtn} onClick={() => setIsModalOpen(true)}>
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
              <span onClick={() => setIsModalOpen(false)} style={{cursor:'pointer'}}>Close</span>
              <span>New Message</span>
              <span style={{color:'#0095f6', cursor:'pointer'}}>Next</span>
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
               {searchTerm.length > 1 && searchResults.length === 0 && (
                 <div style={{padding:'20px', textAlign:'center', color:'#888'}}>No account found.</div>
               )}
               {searchResults.map(user => (
                 <div key={user._id} className={s.userResult} onClick={() => handleSelectUser(user)}>
                    <img src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="u" />
                    <div style={{display:'flex', flexDirection:'column'}}>
                       <span style={{fontWeight:'600'}}>{user.username}</span>
                       <span style={{fontSize:'12px', color:'#737373'}}>{user.fullName}</span>
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