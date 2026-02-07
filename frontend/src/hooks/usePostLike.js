// frontend/src/hooks/usePostLike.js

import { useState, useEffect } from 'react';
import { useToggleLikeMutation } from '../services/api';

export const usePostLike = (post) => {
  const currentUserId = localStorage.getItem('userId');
  const [toggleLikeApi] = useToggleLikeMutation();

  // Вычисляем, что сейчас пришло с сервера/родителя
  const serverLikes = post?.likes || [];
  const serverIsLiked = serverLikes.includes(currentUserId);
  const serverLikesCount = serverLikes.length;

  // 1. Инициализация (Lazy state)
  const [isLiked, setIsLiked] = useState(serverIsLiked);
  const [likesCount, setLikesCount] = useState(serverLikesCount);

  // 2. Синхронизация с сервером
  // Эффект сработает, когда изменятся ВХОДЯЩИЕ данные (serverIsLiked/Count)
  useEffect(() => {
    // Мы обновляем стейт ТОЛЬКО если он отличается от новых пропсов.
    // Это предотвращает лишние рендеры и убирает ошибку.
    
    if (isLiked !== serverIsLiked) {
      setIsLiked(serverIsLiked);
    }
    
    if (likesCount !== serverLikesCount) {
      setLikesCount(serverLikesCount);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverIsLiked, serverLikesCount]); 
  // Мы намеренно не добавляем isLiked/likesCount в зависимости, 
  // чтобы не сломать "Оптимистичный UI" (когда мы кликаем, мы не хотим, 
  // чтобы эффект тут же сбросил наш лайк обратно, пока сервер думает).

  const handleLike = async () => {
    // Оптимистичное обновление
    const prevIsLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!prevIsLiked);
    setLikesCount(prevIsLiked ? prevCount - 1 : prevCount + 1);

    try {
      await toggleLikeApi(post._id).unwrap();
    } catch (error) {
      console.error("Failed to like post:", error);
      // Если ошибка — возвращаем как было
      setIsLiked(prevIsLiked);
      setLikesCount(prevCount);
    }
  };

  return {
    isLiked,
    likesCount,
    handleLike
  };
};