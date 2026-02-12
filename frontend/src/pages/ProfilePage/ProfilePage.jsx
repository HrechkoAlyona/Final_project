// frontend/src/pages/ProfilePage/ProfilePage.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetUserByIdQuery } from "../../services/api";
import ProfileHeader from "./ProfileHeader";
import ProfileGallery from "./ProfileGallery";
import PostModal from "../../components/PostModal/PostModal";
import s from "./ProfilePage.module.scss";

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState(null);
  const { data: user, isLoading, error } = useGetUserByIdQuery(id);
  const currentUserId = localStorage.getItem("userId");
  const isMyProfile =
    currentUserId === id || (user && currentUserId === user._id);

  // 3. Функция перехода к сообщениям
  const handleMessageClick = () => {
    if (user) {
      // Переходим в сообщения и передаем объект user через state
      navigate("/messages", { state: { userToChat: user } });
    }
  };

  if (isLoading) return <div className={s.wrapper}>Loading...</div>;
  if (error) return <div className={s.wrapper}>User not found</div>;

  return (
    <div className={s.wrapper}>
      <div className={s.content}>
        {/* 4. Передаем функцию onMessageClick */}
        <ProfileHeader
          user={user}
          isMyProfile={isMyProfile}
          onMessageClick={handleMessageClick}
        />

        <ProfileGallery posts={user.posts} onPostClick={setSelectedPost} />

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
