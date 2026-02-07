// логика определения активной вкладки по URL
export const determineActiveTab = (location, setActiveTab) => {
  const path = location.pathname;
  // Учитываем, если модалка открыта поверх другого роута
  const bgPath = location.state?.backgroundLocation?.pathname;
  const currentPath = bgPath || path;

  if (currentPath === '/') {
    setActiveTab('home');
  } else if (currentPath.includes('/explore')) {
    setActiveTab('explore');
  } else if (currentPath.includes('/messages')) {
    setActiveTab('messages');
  } else if (currentPath.includes('/profile')) {
    setActiveTab('profile');
  } else {
    setActiveTab('');
  }
};