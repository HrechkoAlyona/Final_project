// frontend\src\components\Footer\Footer.jsx

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
//  Импортируем контекст (проверь, чтобы путь был верным)
import { NavigationContext } from '../../context/NavigationContext'; 
import s from './Footer.module.scss';

export const Footer = () => {
  //  Используем переменные: setActiveTab 
  const { setActiveTab } = useContext(NavigationContext);

  // Вспомогательная функция, чтобы менять активную вкладку
  const handleNavClick = (tabName) => {
    if (setActiveTab) {
      setActiveTab(tabName);
    }
  };

  return (
    <footer className={s.footerWrapper}>
      <div className={s.linksRow}>
        {/* Home */}
        <Link to="/" onClick={() => handleNavClick("home")}>
          Home
        </Link>
        
        {/* Search */}
        <span className={s.textLink} onClick={() => handleNavClick("search")}>
          Search
        </span>
        
        {/* Explore */}
        <Link to="/explore" onClick={() => handleNavClick("explore")}>
          Explore
        </Link>
        
        {/* Messages */}
        <Link to="/messages" onClick={() => handleNavClick("messages")}>
          Messages
        </Link>

        {/* Notifications */}
        <span className={s.textLink} onClick={() => handleNavClick("notifications")}>
          Notifications
        </span>
        
        {/* Create */}
        <span className={s.textLink} onClick={() => handleNavClick("create")}>
          Create
        </span>
      </div>

      <div className={s.copyright}>
        <span>© 2026 ICHgram</span>
      </div>
    </footer>
  );
};