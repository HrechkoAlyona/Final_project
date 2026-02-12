// frontend/src/components/Sidebar/LogoMenu.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import LogoIchgram from '../logos/LogoIchgram';
import s from './Sidebar.module.scss';

const LogoMenu = () => {
  return (
    <div className={s.logoWrapper}>
      <Link to="/" className={s.logoLink}>
        <LogoIchgram className={s.logoImg} />
      </Link>
    </div>
  );
};

export default LogoMenu;