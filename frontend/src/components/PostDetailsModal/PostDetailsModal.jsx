import React from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import PostTopBar from './PostTopBar';
import PostCommentsArea from './PostCommentsArea';
import PostInteractionBar from './PostInteractionBar';
import AddCommentBox from './AddCommentBox';
import s from './PostDetailsModal.module.scss';

const PostDetailsModal = ({ post, onClose }) => {
  // Заглушка, если нет данных поста
  if (!post) return null;

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.closeButtonArea} onClick={onClose}>
        <AiOutlineClose />
      </div>

      <div className={s.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* ЛЕВАЯ ЧАСТЬ: ФОТО */}
        <div className={s.imageSection}>
          <img src={post.image} alt="Post content" />
        </div>

        {/* ПРАВАЯ ЧАСТЬ: ИНФО */}
        <div className={s.sidebarSection}>
          {/* 1. Шапка */}
          <PostTopBar post={post} />

          {/* 2. Комментарии и скролл */}
          <PostCommentsArea post={post} comments={[]} />

          {/* 3. Лайки и статистика */}
          <PostInteractionBar post={post} />

          {/* 4. Форма добавления */}
          <AddCommentBox postId={post._id} />
        </div>
      </div>
    </div>
  );
};

export default PostDetailsModal;