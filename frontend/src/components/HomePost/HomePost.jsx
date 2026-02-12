// frontend\src\components\HomePost\HomePost.jsx
import React, { useState, useRef } from 'react'; 
import { Link } from 'react-router-dom';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai'; 
import { FaRegComment } from 'react-icons/fa'; 
import { formatDistanceToNowStrict } from 'date-fns'; 
import { useAuth } from '../../hooks/useAuth';
import { usePostActions } from '../../hooks/usePostActions'; 
import FollowButton from '../FollowButton/FollowButton';
import Ring from '../logos/Ring';
import s from './HomePost.module.scss';

const HomePost = ({ post, onPostClick }) => {
  const { userId } = useAuth();
  
  const { isLiked, likesCount, handleLike } = usePostActions(post);

  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [isCommentExpanded, setIsCommentExpanded] = useState(false);
  
  // Состояния для анимации сердца и таймера кликов
  const [showHeart, setShowHeart] = useState(false);
  const clickTimer = useRef(null);

  const captionText = post.title || post.description || "";
  const latestComment = post.comments?.length ? post.comments[post.comments.length - 1] : null;
  const isCurrentUser = userId === (post.user?._id || post.user);

  const CAPTION_MAX_LEN = 40; 
  const COMMENT_MAX_LEN = 10;

  // Форматируем время
  let timeAgo = 'now';
  try {
    if (post.createdAt) {
      const distance = formatDistanceToNowStrict(new Date(post.createdAt));
      const [val, unit] = distance.split(' ');
      timeAgo = `${val}${unit[0]}`; 
    }
  } catch (err) {
    console.error("Error formatting time:", err);
  }

  // --- ОБРАБОТЧИК КЛИКОВ ПО КАРТИНКЕ ---
  // Разделяет одиночный клик (открыть) и двойной (лайкнуть)
  const handleImageClick = (e) => {
    e.stopPropagation();

    if (clickTimer.current) {
      // Это ВТОРОЙ клик в течение 250мс -> Двойной клик
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      
      // Ставим лайк (если еще не стоит)
      if (!isLiked) {
        handleLike(e);
      }
      
      // Анимация сердца
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1000);
    } else {
      // Это ПЕРВЫЙ клик -> Запускаем таймер ожидания
      clickTimer.current = setTimeout(() => {
        onPostClick(); // Если второй клик не пришел — открываем пост
        clickTimer.current = null;
      }, 250); 
    }
  };

  const renderTextWithMore = (text, maxLength, isExpanded, setExpanded) => {
    if (!text || text.length <= maxLength) return <span className={s.text}>{text}</span>;
    const textDisplay = isExpanded ? text : text.slice(0, maxLength);
    return (
      <>
        <span className={s.text}>{textDisplay}</span>
        {!isExpanded && (
          <>
            ... 
            <span 
              className={s.moreBtn} 
              onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
            >
              more
            </span>
          </>
        )}
      </>
    );
  };

  return (
    <article className={s.post}>
      {/* 1. ШАПКА */}
      <header className={s.header}>
        <div className={s.authorInfo}>
          <Link to={`/profile/${post.user?._id}`} className={s.avatarWrapper} onClick={(e) => e.stopPropagation()}>
            <Ring />
            <img 
              src={post.user?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
              alt="avatar" 
              className={s.avatarImg}
            />
          </Link>

          <div className={s.textInfo}>
            <Link to={`/profile/${post.user?._id}`} className={s.username} onClick={(e) => e.stopPropagation()}>
              {post.user?.username}
            </Link>
            <span className={s.dot}>•</span>
            <span className={s.time}>{timeAgo}</span>

            {!isCurrentUser && (
              <>
                <span className={s.dot}>•</span>
                <div onClick={(e) => e.stopPropagation()}>
                  <FollowButton targetUser={post.user} size="small" />
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. КАРТИНКА */}
      <div 
        className={s.imageWrapper} 
        onClick={handleImageClick} 
        style={{ cursor: 'pointer', position: 'relative' }}
      >
        <img src={post.image} alt="content" />
        
        {/* Анимация "вылетающего" сердца */}
        {showHeart && (
          <div className={s.floatingHeart}>
            <AiFillHeart />
          </div>
        )}
      </div>

      {/* 3. ФУТЕР */}
      <div className={s.footer}>
        <div className={s.actions}>
          <button onClick={handleLike} className={s.actionBtn}>
            {isLiked ? <AiFillHeart color="#ed4956" /> : <AiOutlineHeart />}
          </button>
          
          <button className={s.actionBtn} onClick={onPostClick}>
            <FaRegComment />
          </button>
        </div>

        <div className={s.likes}>{likesCount.toLocaleString()} likes</div>

        {captionText && (
          <div className={s.caption}>
            <Link to={`/profile/${post.user?._id}`} className={s.username} onClick={(e) => e.stopPropagation()}>
              {post.user?.username}
            </Link>
            {renderTextWithMore(captionText, CAPTION_MAX_LEN, isCaptionExpanded, setIsCaptionExpanded)}
          </div>
        )}

        {latestComment && (
          <div className={s.commentPreview}>
            <Link to={`/profile/${latestComment.user?._id}`} className={s.username} onClick={(e) => e.stopPropagation()}>
              {latestComment.user?.username || "Unknown"}
            </Link>
            {renderTextWithMore(latestComment.text, COMMENT_MAX_LEN, isCommentExpanded, setIsCommentExpanded)}
          </div>
        )}

        {post.comments?.length > 0 && (
          <div className={s.viewComments} onClick={onPostClick}>
            View all {post.comments.length} comments
          </div>
        )}
      </div>
    </article>
  );
};

export default HomePost;