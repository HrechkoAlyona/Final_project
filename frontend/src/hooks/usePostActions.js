// frontend\src\hooks\usePostActions.js
import { useState } from 'react';
import { useToggleLikeMutation, useDeletePostMutation } from '../services/api';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';

export const usePostActions = (post) => {
  const { userId } = useAuth();
  const [toggleLikeApi] = useToggleLikeMutation();
  const [deletePostApi] = useDeletePostMutation();
  const [optimisticLike, setOptimisticLike] = useState(null);

  if (!post) return {};

  // 🔥 ИСПРАВЛЕНИЕ: Используем .some() и приведение к String
  const alreadyLiked = post.likes?.some(id => String(id) === String(userId));

  const isLiked = optimisticLike !== null 
    ? optimisticLike 
    : alreadyLiked;

  const likesCount = optimisticLike !== null
    ? (alreadyLiked 
        ? (optimisticLike ? post.likes.length : post.likes.length - 1)
        : (optimisticLike ? post.likes.length + 1 : post.likes.length))
    : (post.likes?.length || 0);

  const handleLike = async (e) => {
    if (e) {
      e.stopPropagation();
      if (e.type === 'dblclick') e.preventDefault();
    }
    
    const nextLikeStatus = !isLiked;
    setOptimisticLike(nextLikeStatus);

    try {
      await toggleLikeApi(post._id).unwrap();
      // Ждем обновления кэша от RTK Query, оптимистичный стейт держит картинку
    } catch {
      setOptimisticLike(null);
      toast.error("Failed to update like");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure?")) {
      try {
        await deletePostApi(post._id).unwrap();
        toast.success("Post deleted");
      } catch {
        toast.error("Error deleting post");
      }
    }
  };

  const authorId = post.author?._id || post.author || post.user?._id || post.user;

  return {
    isLiked,
    likesCount,
    handleLike,
    handleDelete,
    isOwner: String(authorId) === String(userId),
  };
};