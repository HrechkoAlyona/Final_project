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

import LogoIchgram from '../logos/LogoIchgram';
import SearchSidebar from './SearchSidebar'; 
import { useGetMeQuery } from '../../services/api'; //   хук для получения данных
import s from './Sidebar.module.scss';

const Sidebar = ({ onCreateClick }) => {
  const userId = localStorage.getItem('userId');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Получаем данные текущего пользователя (чтобы взять аватарку)
  const { data: currentUser } = useGetMeQuery();
  const userAvatar = currentUser?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

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
        <div className={s.logo}>
          <LogoIchgram width="103" />
        </div>

        <nav className={s.nav}>
          {navItems.map((item) => {
            const isProfile = item.label === 'Profile';

            // Определяем контент иконки: Картинка для профиля ИЛИ SVG для остальных
            const IconContent = isProfile ? (
               <img src={userAvatar} alt="profile" className={s.profileAvatar} />
            ) : (
               item.icon
            );
            
            // ВАРИАНТ 1: Кнопка-действие (Search или Create)
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

            // ВАРИАНТ 2: Обычная ссылка (Home, Explore, Profile...)
            return (
              <NavLink 
                key={item.label} 
                to={item.path} 
                onClick={() => handleNavClick(item.label)} 
                className={({ isActive }) => 
                  //  Добавляем класс s.profileItem специально для профиля (для отступа)
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