// frontend\src\pages\ProfilePage\ProfileHeader.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Ring from "../../components/logos/Ring";
import FollowButton from "../../components/FollowButton/FollowButton";
import UserListModal from "../../components/UserListModal/UserListModal";
import { AiOutlineSetting } from "react-icons/ai";
import s from "./ProfilePage.module.scss";

const ProfileHeader = ({ user, isMyProfile, onMessageClick }) => {
  const navigate = useNavigate();

  // Состояние: развернут текст или нет
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  //  ЛИМИТ СИМВОЛОВ
  const MAX_LENGTH = 108;

  if (!user) return null;

  const handleLogout = () => {
    if (window.confirm("Log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/login");
      window.location.reload();
    }
  };

  //  ЛОГИКА ОБРЕЗКИ ТЕКСТА
  const bioText = user.bio || "";
  // Показываем кнопку "more", если текст длинный и еще не развернут
  const shouldTruncate = bioText.length > MAX_LENGTH && !isExpanded;

  // Если надо обрезать — режем, иначе показываем всё
  const textToDisplay = shouldTruncate ? bioText.slice(0, MAX_LENGTH) : bioText;

  const getFullUrl = (url) =>
    !url ? "" : url.startsWith("http") ? url : `https://${url}`;

  return (
    <>
      <header className={s.header}>
        <div className={s.avatarWrapper}>
          <Ring />
          <img
            src={
              user.avatar ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="avatar"
            className={s.avatarImg}
          />
        </div>

        <div className={s.details}>
          <div className={s.topRow}>
            <h2>{user.username}</h2>

            {isMyProfile ? (
              <div className={s.actionsRow}>
                <button
                  className={s.editButton}
                  onClick={() => navigate("/edit-profile")}
                >
                  Edit profile
                </button>
                <button
                  className={s.settingsButton}
                  onClick={handleLogout}
                  title="Settings / Logout"
                >
                  <AiOutlineSetting size={24} />
                </button>
              </div>
            ) : (
              <div className={s.actionsRow}>
                <FollowButton targetUser={user} size="medium" />
                <button className={s.messageButton} onClick={onMessageClick}>
                  Message
                </button>
              </div>
            )}
          </div>

          <div className={s.stats}>
            <span>
              <strong>{user.posts?.length || 0}</strong> posts
            </span>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => setActiveModal("followers")}
            >
              <strong>{user.followersCount || 0}</strong> followers
            </span>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => setActiveModal("following")}
            >
              <strong>{user.followingCount || 0}</strong> following
            </span>
          </div>

          {/* СЕКЦИЯ БИОГРАФИИ */}
          <div className={s.bioSection}>
            <div className={s.bioText}>
              {textToDisplay}
              {shouldTruncate && (
                <>
                  ...
                  <span
                    className={s.moreLink}
                    onClick={() => setIsExpanded(true)}
                  >
                    more
                  </span>
                </>
              )}
            </div>

            {user.website && (
              <a
                href={getFullUrl(user.website)}
                target="_blank"
                rel="noopener noreferrer"
                className={s.websiteLink}
              >
                {user.website}
              </a>
            )}
          </div>
        </div>
      </header>

      {activeModal && (
        <UserListModal
          userId={user._id}
          type={activeModal}
          title={activeModal === "followers" ? "Followers" : "Following"}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
};

export default ProfileHeader;
