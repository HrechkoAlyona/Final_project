// frontend/src/components/Footer/Footer.jsx

import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavigationContext } from '../../context/NavigationContext'; 
import s from './Footer.module.scss';

export const Footer = () => {
  const { setActiveTab } = useContext(NavigationContext);
  const location = useLocation();

  const handleNavClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <footer className={s.footerWrapper}>
      <div className={s.linksRow}>
        {/* ССЫЛКИ НА СТРАНИЦЫ */}
        
        {/* HOME */}
        <Link 
          to="/" 
          className={location.pathname === '/' ? s.activeLink : ''}
          onClick={() => handleNavClick("home")}
        >
          Home
        </Link>

        {/* EXPLORE */}
        <Link 
          to="/explore" 
          className={location.pathname === '/explore' ? s.activeLink : ''}
          onClick={() => handleNavClick("explore")}
        >
          Explore
        </Link>

        {/* MESSAGES (с проверкой startsWith) */}
        <Link 
          to="/messages" 
          className={location.pathname.startsWith('/messages') ? s.activeLink : ''}
          onClick={() => handleNavClick("messages")}
        >
          Messages
        </Link>

        {/* МОДАЛЬНЫЕ ОКНА */}
        <span className={s.textLink} onClick={() => handleNavClick("search")}>
          Search
        </span>
        <span className={s.textLink} onClick={() => handleNavClick("notifications")}>
          Notifications
        </span>
        <span className={s.textLink} onClick={() => handleNavClick("create")}>
          Create
        </span >
      </div>
      <div className={s.copyright}><span>© 2026 ICHgram</span></div>
    </footer>
  );
};