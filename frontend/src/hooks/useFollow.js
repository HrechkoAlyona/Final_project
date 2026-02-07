// frontend/src/hooks/useFollow.js

import { useState, useEffect } from 'react';
import { useFollowUserMutation } from '../services/api';

export const useFollow = (targetUser) => {
  const currentUserId = localStorage.getItem('userId');
  const [followUserApi] = useFollowUserMutation();

  // 1. Инициализация состояния
  // Проверяем, есть ли наш ID в списке followers целевого юзера
  const [isFollowing, setIsFollowing] = useState(() => {
    if (!targetUser || !targetUser.followers) return false;
    return targetUser.followers.includes(currentUserId);
  });

  const [followersCount, setFollowersCount] = useState(() => {
    if (!targetUser || !targetUser.followers) return 0;
    return targetUser.followers.length;
  });

  // 2. Синхронизация с сервером (если пришли новые данные профиля)
  useEffect(() => {
    if (targetUser && targetUser.followers) {
      const serverIsFollowing = targetUser.followers.includes(currentUserId);
      const serverCount = targetUser.followers.length;

      if (isFollowing !== serverIsFollowing) {
        setIsFollowing(serverIsFollowing);
      }
      if (followersCount !== serverCount) {
        setFollowersCount(serverCount);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUser?.followers, currentUserId]);

  const handleFollow = async () => {
    // Не даем подписаться на самого себя (на всякий случай)
    if (targetUser._id === currentUserId) return;

    // Оптимистичное обновление
    const prevIsFollowing = isFollowing;
    const prevCount = followersCount;

    setIsFollowing(!prevIsFollowing);
    setFollowersCount(prevIsFollowing ? prevCount - 1 : prevCount + 1);

    try {
      await followUserApi(targetUser._id).unwrap();
    } catch (error) {
      console.error("Failed to follow/unfollow:", error);
      // Откат при ошибке
      setIsFollowing(prevIsFollowing);
      setFollowersCount(prevCount);
    }
  };

  return {
    isFollowing,
    followersCount,
    handleFollow
  };
};