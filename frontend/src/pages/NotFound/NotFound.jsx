import React from 'react';
import { Link } from 'react-router-dom';
import notFoundBg from '../../assets/images/Background.png'; 
import s from './NotFound.module.scss';

const NotFound = () => {
  return (
    <div className={s.content}>
      <div className={s.innerBlock}>
        
        {/* Картинка */}
        <div className={s.imageWrapper}>
          <img 
            src={notFoundBg} 
            alt="Page Not Found" 
          />
        </div>

        {/* Текст */}
        <div className={s.textBlock}>
          <h2>Oops! Page Not Found (404 Error)</h2>
          <p>
            We're sorry, but the page you're looking for doesn't seem to exist. 
            If you typed the URL manually, please double-check the spelling. 
            If you clicked on a link, it may be outdated or broken.
          </p>
          <Link to="/">Go back to Home</Link>
        </div>

      </div>
    </div>
  );
};

export default NotFound;