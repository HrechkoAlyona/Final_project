import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetFollowersQuery, useGetFollowingQuery, useGetMeQuery } from '../../services/api'; // 🔥 1. Добавили useGetMeQuery
import FollowButton from '../FollowButton/FollowButton'; 
import s from './UserListModal.module.scss';

// Иконки
import { AiOutlineClose, AiOutlineMessage } from 'react-icons/ai'; 

const UserListModal = ({ userId, type, onClose, title }) => {
  const navigate = useNavigate();

  // 1. Получаем данные о себе (чтобы узнать свой ID)
  const { data: myUser } = useGetMeQuery();

  // 2. Динамически выбираем хук для списка
  const hook = type === 'followers' ? useGetFollowersQuery : useGetFollowingQuery;
  const { data: users = [], isLoading } = hook(userId);

  // Переход на профиль
  const handleUserClick = (targetId) => {
    onClose(); 
    navigate(`/profile/${targetId}`);
  };

  // Написать сообщение
  const handleMessageClick = (e, userToChat) => {
    e.stopPropagation(); 
    onClose();
    navigate('/direct/inbox', { state: { userToChat } });
  };

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className={s.header}>
          <h3>{title}</h3>
          <button className={s.closeBtn} onClick={onClose}>
            <AiOutlineClose />
          </button>
        </div>

        {/* LIST */}
        <div className={s.list}>
          {isLoading && <div style={{padding: 20, textAlign: 'center'}}>Loading...</div>}
          
          {!isLoading && users.length === 0 && (
             <div style={{padding: 20, textAlign: 'center', color: '#888'}}>Empty list</div>
          )}

          {users.map((user) => {
            // 🔥 3. ПРОВЕРКА: Это я?
            const isMe = myUser?._id === user._id;

            return (
                <div key={user._id} className={s.listItem}>
                
                {/* Аватар + Имя */}
                <div className={s.userInfo} onClick={() => handleUserClick(user._id)}>
                    <img 
                    src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                    alt="avatar" 
                    className={s.avatar} 
                    />
                    <div className={s.textInfo}>
                    <span className={s.username}>{user.username}</span>
                    <span className={s.fullname}>{user.fullName || user.username}</span>
                    </div>
                </div>

                {/*  4. ПОКАЗЫВАЕМ КНОПКИ ТОЛЬКО ЕСЛИ ЭТО НЕ Я */}
                {!isMe && (
                    <div className={s.actions}>
                        {/* Кнопка "Написать" */}
                        <div 
                            className={s.msgIcon} 
                            title="Send message"
                            onClick={(e) => handleMessageClick(e, user)}
                        >
                            <AiOutlineMessage size={22} />
                        </div>

                        {/* Кнопка Follow */}
                        <div style={{ transform: 'scale(0.9)' }}> 
                            <FollowButton targetUser={user} />
                        </div>
                    </div>
                )}

                </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default UserListModal;