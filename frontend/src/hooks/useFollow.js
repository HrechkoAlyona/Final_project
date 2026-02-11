// frontend\src\hooks\useFollow.js

import { useFollowUserMutation, useGetMeQuery } from '../services/api';

export const useFollow = (targetUser) => {
  // 1. Мутация для клика
  const [followUser, { isLoading }] = useFollowUserMutation();
  
  // 2. Получаем данные о ТЕБЕ (getMe)
  const { data: me } = useGetMeQuery();

  // 3. ID того, на кого хотим подписаться
  const targetId = String(targetUser?._id || targetUser);

  // 4. Логика проверки: есть ли targetId в твоем списке me.following?
  const isFollowing = me?.following?.some(id => 
    String(id._id || id) === targetId
  ) ?? false;

  const handleFollow = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isLoading) return;
    try {
      await followUser(targetId).unwrap();
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  return { isFollowing, handleFollow, isLoading };
};