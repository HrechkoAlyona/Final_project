// frontend\src\components\Sidebar\Sidebar.jsx

import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom'; 
import { 
  AiFillHome, 
  AiOutlineSearch, 
  AiOutlineCompass, 
  AiOutlineHeart, 
  AiOutlinePlusSquare 
} from 'react-icons/ai';

//  Импортируем иконки мессенджера 
import { RiMessengerLine, RiMessengerFill } from "react-icons/ri"; 

import LogoLogout from './LogoLogout'; 
import SearchSidebar from './SearchSidebar'; 
import { useAuth } from '../../hooks/useAuth';
import s from './Sidebar.module.scss';

const Sidebar = ({ onCreateClick }) => {
  const { userId, me } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const location = useLocation(); //  Получаем текущий путь, чтобы знать, активен ли чат

  const userAvatar = me?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const handleNavClick = (label, action) => {
    if (label === 'Search') {
      setIsSearchOpen(!isSearchOpen); 
    } else {
      setIsSearchOpen(false);
      if (action) action();
    }
  };

  // Проверяем, находимся ли мы в разделе сообщений (начинается с /direct)
  const isMessagesActive = location.pathname.startsWith('/direct');

  const navItems = [
    { path: '/', icon: <AiFillHome />, label: 'Home' },
    { icon: <AiOutlineSearch />, label: 'Search' },
    { path: '/explore', icon: <AiOutlineCompass />, label: 'Explore' },
    
    //  ПУНКТ СООБЩЕНИЙ
    { 
      path: '/direct/inbox', // Правильный путь
      // Если мы в сообщениях — показываем закрашенную иконку, иначе контурную
      icon: isMessagesActive ? <RiMessengerFill size={26} /> : <RiMessengerLine size={26} />, 
      label: 'Messages' 
    },

    { path: '/notifications', icon: <AiOutlineHeart />, label: 'Notifications' },
    { icon: <AiOutlinePlusSquare />, label: 'Create', action: onCreateClick },
    { path: `/profile/${userId}`, label: 'Profile' }, 
  ];

  return (
    <>
      <aside className={s.sidebar}>
        
        <LogoLogout />

        <nav className={s.nav}>
          {navItems.map((item) => {
            const isProfile = item.label === 'Profile';
            
            // Определяем иконку
            const IconContent = isProfile ? (
              <img src={userAvatar} alt="profile" className={s.profileAvatar} />
            ) : (
              item.icon
            );
            
            // Для кнопок без пути (Search, Create)
            if (!item.path) {
              const isActiveBtn = item.label === 'Search' && isSearchOpen;
              return (
                <div 
                  key={item.label} 
                  className={`${s.navItem} ${isActiveBtn ? s.active : ''}`}
                  onClick={() => handleNavClick(item.label, item.action)} 
                  style={{ cursor: 'pointer' }}
                >
                  {IconContent}
                  <span>{item.label}</span>
                </div>
              );
            }

            // Для ссылок (NavLink)
            return (
              <NavLink 
                key={item.label} 
                to={item.path} 
                onClick={() => handleNavClick(item.label)} 
                className={({ isActive }) => 
                  // Если это Messages, мы используем свою проверку isMessagesActive, 
                  // иначе стандартную isActive от NavLink
                  `${s.navItem} ${(isActive || (item.label === 'Messages' && isMessagesActive)) ? s.active : ''} ${isProfile ? s.profileItem : ''}`
                }
              >
                {IconContent}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <SearchSidebar 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
};

export default Sidebar;