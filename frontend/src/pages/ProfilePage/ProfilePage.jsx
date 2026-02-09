// frontend/src/pages/ProfilePage/ProfilePage.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetUserByIdQuery } from '../../services/api';
import ProfileHeader from './ProfileHeader';
import ProfileGallery from './ProfileGallery';
import PostModal from '../../components/PostModal/PostModal'; 
import s from './ProfilePage.module.scss';

const ProfilePage = () => {
  const { id } = useParams();
  const [selectedPost, setSelectedPost] = useState(null);

  const { data: user, isLoading, error } = useGetUserByIdQuery(id);
  const currentUserId = localStorage.getItem('userId');
  const isMyProfile = currentUserId === id;

  if (isLoading) return <div className={s.wrapper}>Loading...</div>;
  if (error) return <div className={s.wrapper}>User not found</div>;

  return (
    <div className={s.wrapper}>
      <div className={s.content}>
        <ProfileHeader user={user} isMyProfile={isMyProfile} />

        <ProfileGallery posts={user.posts} onPostClick={setSelectedPost} />

        {selectedPost && (
          <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
