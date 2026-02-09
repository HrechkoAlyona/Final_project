// frontend\src\components\Sidebar\Sidebar.jsx

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  AiFillHome, 
  AiOutlineSearch, 
  AiOutlineCompass, 
  AiOutlineMessage, 
  AiOutlineHeart, 
  AiOutlinePlusSquare 
} from 'react-icons/ai';

// ✅ ИМПОРТИРУЕМ НАШ НОВЫЙ КОМПОНЕНТ
import LogoLogout from './LogoLogout'; 

import SearchSidebar from './SearchSidebar'; 
import { useAuth } from '../../hooks/useAuth';
import s from './Sidebar.module.scss';

const Sidebar = ({ onCreateClick }) => {
  const { userId, me } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const userAvatar = me?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const handleNavClick = (label, action) => {
    if (label === 'Search') {
      setIsSearchOpen(!isSearchOpen); 
    } else {
      setIsSearchOpen(false);
      if (action) action();
    }
  };

  const navItems = [
    { path: '/', icon: <AiFillHome />, label: 'Home' },
    { icon: <AiOutlineSearch />, label: 'Search' },
    { path: '/explore', icon: <AiOutlineCompass />, label: 'Explore' },
    { path: '/messages', icon: <AiOutlineMessage />, label: 'Messages' },
    { path: '/notifications', icon: <AiOutlineHeart />, label: 'Notifications' },
    { icon: <AiOutlinePlusSquare />, label: 'Create', action: onCreateClick },
    { path: `/profile/${userId}`, label: 'Profile' }, 
  ];

  return (
    <>
      <aside className={s.sidebar}>
        
        {/* 🔥 ЗАМЕНЯЕМ СТАРЫЙ ЛОГОТИП НА КОМПОНЕНТ С ВЫХОДОМ */}
        <LogoLogout />

        <nav className={s.nav}>
          {navItems.map((item) => {
            const isProfile = item.label === 'Profile';
            const IconContent = isProfile ? (
              <img src={userAvatar} alt="profile" className={s.profileAvatar} />
            ) : (
              item.icon
            );
            
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

            return (
              <NavLink 
                key={item.label} 
                to={item.path} 
                onClick={() => handleNavClick(item.label)} 
                className={({ isActive }) => 
                  `${s.navItem} ${isActive ? s.active : ''} ${isProfile ? s.profileItem : ''}`
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