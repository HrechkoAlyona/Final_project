// frontend/src/components/Sidebar/LogoLogout.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoIchgram from '../logos/LogoIchgram';
import s from './Sidebar.module.scss'; // Используем те же стили

const LogoLogout = () => {
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.stopPropagation(); // Чтобы клик не сработал на родительские элементы
    
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      navigate('/login');
      window.location.reload();
    }
  };

  return (
    <div 
      className={s.logoContainer}
      onMouseEnter={() => setShowLogout(true)}
      onMouseLeave={() => setShowLogout(false)}
    >
      {/* Сам логотип */}
      <div className={s.logoIcon}>
        <LogoIchgram width="103" />
      </div>

      {/* Кнопка выхода (Появляется при наведении) */}
      {showLogout && (
        <div className={s.logoutTooltip} onClick={handleLogout}>
          Log out
        </div>
      )}
    </div>
  );
};

export default LogoLogout;