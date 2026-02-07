// frontend\src\context\NavigationProvider.jsx

import React, { useState } from 'react';
import { NavigationContext } from './NavigationContext'; // Импортируем контекст из соседнего файла

export const NavigationProvider = ({ children }) => {
  // Состояние активной вкладки ('home', 'search', 'create' и т.д.)
  const [activeTab, setActiveTab] = useState('home');
  
  // Состояние боковой панели (для поиска или уведомлений)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <NavigationContext.Provider 
      value={{ 
        activeTab, 
        setActiveTab, 
        isDrawerOpen, 
        setIsDrawerOpen 
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};