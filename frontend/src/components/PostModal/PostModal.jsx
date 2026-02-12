// frontend/src/components/PostModal/PostModal.jsx

import React, { useState } from 'react'; 
import { AiOutlineClose } from 'react-icons/ai';
import toast from 'react-hot-toast';
import { useDeletePostMutation, useUpdatePostMutation, useGetPostByIdQuery } from '../../services/api';
import s from './PostModal.module.scss';

import PostImage from './PostImage';
import PostHeader from './PostHeader';
import PostComments from './PostComments';
import PostActions from './PostActions';
import PostOptions from './PostOptions';

const PostModal = ({ post: initialPost, onClose }) => {
  const { data: freshPost, isSuccess } = useGetPostByIdQuery(initialPost?._id, { skip: !initialPost?._id });
  const post = isSuccess && freshPost ? freshPost : initialPost;

  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Стейты для редактирования
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  
  // ДЛЯ КАРТИНКИ
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();

  if (!post) return null;

  const currentUserId = localStorage.getItem('userId');
  const authorData = (post.author && typeof post.author === 'object') ? post.author 
                    : (post.user && typeof post.user === 'object') ? post.user : null;
  const authorId = authorData?._id || post.user || post.author;
  const isMyPost = String(currentUserId) === String(authorId);

  // --- ФУНКЦИИ ---

  const handleEditMode = () => {
    setEditContent(post.description || post.content || "");
    setEditTitle(post.title || "");
    setPreviewUrl(null);
    setSelectedFile(null);
    setIsEditing(true);
    setShowOptions(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveEdit = async () => {
    try {
      const formData = new FormData();
      formData.append('description', editContent);
      formData.append('title', editTitle);
      
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      await updatePost({ id: post._id, body: formData }).unwrap();
      
      toast.success("Post updated!");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
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
        
        {/* ЛЕВАЯ ЧАСТЬ (Картинка) */}
    
        <PostImage 
          post={post} 
          isEditing={isEditing} 
          previewUrl={previewUrl} 
          onFileChange={handleFileChange}
        />

        {/* ПРАВАЯ ЧАСТЬ (Контент) */}
        <div className={s.contentSection}>
          <PostHeader 
            authorData={authorData}
            isEditing={isEditing}
            isUpdating={isUpdating}
            onCancel={() => { setIsEditing(false); setPreviewUrl(null); }}
            onSave={handleSaveEdit}
            onShowOptions={() => setShowOptions(true)}
            onClose={onClose}
          />

          {/* ВЕРХНЯЯ ЧАСТЬ СПРАВА: Комментарии / Редактирование описания */}
          <PostComments 
            post={post}
            authorData={authorData}
            isEditing={isEditing}
            editContent={editContent}
            setEditContent={setEditContent}
            onClose={onClose} 
          />

          {/* НИЖНЯЯ ЧАСТЬ СПРАВА: */}
          {isEditing ? (
             // --- БЛОК РЕДАКТИРОВАНИЯ ЗАГОЛОВКА ---
             <div className={s.editFooter}>
                <label className={s.inputLabel}>Title</label>
                <textarea 
                  className={s.editTitleInput} 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Add a title..."
                  rows={2} 
                />
             </div>
          ) : (
             // --- ОБЫЧНЫЕ ДЕЙСТВИЯ (Лайки и т.д.) ---
             <PostActions post={post} />
          )}
        </div>
      </div>

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
