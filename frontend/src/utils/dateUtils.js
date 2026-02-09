// src/utils/dateUtils.js
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  
  // Формат: "7 Feb 2026" или "2 hours ago"
  // Для начала сделаем простой понятный формат
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};