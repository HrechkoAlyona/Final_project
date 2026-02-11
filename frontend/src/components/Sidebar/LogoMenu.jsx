import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoIchgram from '../logos/LogoIchgram';
import s from './Sidebar.module.scss';

const LogoMenu = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // закрытие меню при клике вне блока
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      navigate('/login'); // без reload
    }
  };

  return (
    <div className={s.logoMenuWrapper} ref={menuRef}>
      
      {/* Логотип */}
      <div className={s.logoIcon} onClick={() => setOpen(prev => !prev)}>
        <LogoIchgram width="103" />
      </div>

      {/* Меню */}
      {open && (
        <div className={s.logoDropdown}>
          <div className={s.menuItem} onClick={handleLogout}>
            Log out
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoMenu;