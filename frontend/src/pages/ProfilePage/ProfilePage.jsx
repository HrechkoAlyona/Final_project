// frontend/src/pages/ProfilePage/ProfilePage.jsx

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetUserByIdQuery } from '../../services/api';

// Импортируем наши новые компоненты
import ProfileHeader from './ProfileHeader';
import ProfileGallery from './ProfileGallery';
import PostModal from '../../components/PostModal/PostModal'; 

import s from './ProfilePage.module.scss';

const ProfilePage = () => {
  const { id } = useParams();
  
  // Стейт для модального окна
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Запрос данных
  const { data: user, isLoading, error } = useGetUserByIdQuery(id);
  const currentUserId = localStorage.getItem('userId');
  
  // Проверка: это мой профиль?
  const isMyProfile = currentUserId === id;

  if (isLoading) return <div className={s.wrapper}>Loading...</div>;
  if (error) return <div className={s.wrapper}>User not found</div>;

  return (
    <div className={s.wrapper}>
      <div className={s.content}>
        
        {/* 1. Компонент Шапки (передаем user и флаг isMyProfile) */}
        <ProfileHeader 
          user={user} 
          isMyProfile={isMyProfile} 
        />

        {/* 2. Компонент Галереи (передаем посты и функцию клика) */}
        <ProfileGallery 
          posts={user.posts} 
          onPostClick={setSelectedPost} 
        />

        {/* 3. Модальное окно */}
        {selectedPost && (
          <PostModal 
            post={selectedPost} 
            onClose={() => setSelectedPost(null)} 
          />
        )}

      </div>
    </div>
  );
};

export default ProfilePage;