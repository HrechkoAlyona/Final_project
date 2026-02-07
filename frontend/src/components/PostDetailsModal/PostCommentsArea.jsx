import React from 'react';
import CommentItem from './CommentItem';
import s from './PostDetailsModal.module.scss';

const PostCommentsArea = ({ post, comments = [] }) => {
  // Создаем фейковый объект комментария из описания поста
  const captionAsComment = {
    _id: 'caption',
    author: post?.author,
    content: post?.content,
    createdAt: post?.createdAt,
    like_count: 0
  };

  return (
    <div className={s.commentsArea}>
      {/* 1. Описание поста отображаем как первый комментарий */}
      {post?.content && (
        <CommentItem comment={captionAsComment} />
      )}

      {/* 2. Реальные комментарии */}
      {comments.map((comment) => (
        <CommentItem key={comment._id} comment={comment} />
      ))}
    </div>
  );
};

export default PostCommentsArea;