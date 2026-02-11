// src/utils/dateUtils.js

// 1. Для "взрослых" дат (например, дата создания самого поста внизу)
// Вернет: "Feb 12, 2026"
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

// 2. Для комментариев и уведомлений 
// Вернет: "now", "5m", "2h", "3d", "1w"
export const formatShortTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  // Если время в будущем или разница отрицательная (рассинхрон часов)
  if (diffInSeconds < 0) return 'now';

  if (diffInSeconds < 60) return 'now';
  
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
};