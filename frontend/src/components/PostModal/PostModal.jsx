// frontend/src/components/PostModal/PostModal.jsx
import React, { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import toast from 'react-hot-toast';
import { useDeletePostMutation, useUpdatePostMutation, useGetPostByIdQuery } from '../../services/api';
import s from './PostModal.module.scss';

// Подключаем наши кирпичики
import PostImage from './PostImage';
import PostHeader from './PostHeader';
import PostComments from './PostComments';
import PostActions from './PostActions';
import PostOptions from './PostOptions';

const PostModal = ({ post: initialPost, onClose }) => {
  // 1. Получаем свежие данные
  const { data: freshPost, isSuccess } = useGetPostByIdQuery(initialPost?._id, { skip: !initialPost?._id });
  const post = isSuccess && freshPost ? freshPost : initialPost;

  // 2. Глобальные стейты модалки
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Стейт для редактирования
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();

  if (!post) return null;

  const currentUserId = localStorage.getItem('userId');
  // Логика автора
  const authorData = (post.author && typeof post.author === 'object') ? post.author 
                   : (post.user && typeof post.user === 'object') ? post.user : null;
  const authorId = authorData?._id || post.user || post.author;
  const isMyPost = String(currentUserId) === String(authorId);

  // --- ФУНКЦИИ УПРАВЛЕНИЯ ---

  const handleEditMode = () => {
    setEditContent(post.description || post.content || "");
    setEditTitle(post.title || "");
    setIsEditing(true);
    setShowOptions(false);
  };

  const handleSaveEdit = async () => {
    try {
      await updatePost({ id: post._id, content: editContent, title: editTitle }).unwrap();
      toast.success("Post updated!");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update post");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure?")) {
      try {
        await deletePost(post._id).unwrap();
        toast.success("Post deleted");
        onClose();
      } catch {
        toast.error("Error deleting post");
      }
    }
  };

  return (
    <div className={s.overlay} onClick={onClose}>
      <button className={s.closeBtn} onClick={onClose}><AiOutlineClose /></button>

      <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
        
        {/* ЛЕВАЯ ЧАСТЬ: Картинка + Заголовок */}
        <PostImage 
          post={post} 
          isEditing={isEditing} 
          editTitle={editTitle} 
          setEditTitle={setEditTitle} 
        />

        {/* ПРАВАЯ ЧАСТЬ: Весь контент */}
        <div className={s.contentSection}>
          
          <PostHeader 
            authorData={authorData}
            isEditing={isEditing}
            isUpdating={isUpdating}
            onCancel={() => setIsEditing(false)}
            onSave={handleSaveEdit}
            onShowOptions={() => setShowOptions(true)}
            // 🔥 Передаем onClose вниз
            onClose={onClose}
          />

          <PostComments 
            post={post}
            authorData={authorData}
            isEditing={isEditing}
            editContent={editContent}
            setEditContent={setEditContent}
            // 🔥 Передаем onClose вниз
            onClose={onClose}
          />

          {/* Лайки и форма комментария (скрываем при редактировании) */}
          {!isEditing && (
            <PostActions post={post} />
          )}
        </div>
      </div>

      {/* Всплывающее меню */}
      {showOptions && (
        <PostOptions 
          isMyPost={isMyPost}
          isDeleting={isDeleting}
          onDelete={handleDelete}
          onEdit={handleEditMode}
          onClose={() => setShowOptions(false)}
          postId={post._id}
        />
      )}
    </div>
  );
};

export default PostModal;