// frontend\src\pages\Auth\Login.jsx

import React from "react";
import LoginForm from "../../components/AuthForms/LoginForm";
import s from "./AuthPage.module.scss";
import phonesImg from "../../assets/images/home-phones.png";

const Login = () => {
  return (
    <div className={s.screenWrapper}>
      <div className={s.contentRow}>
        {/* Картинка телефонов (принадлежит странице входа) */}
        <div className={s.previewSection}>
          <img src={phonesImg} alt="phones" />
        </div>

        {/* Форма */}
        <div className={s.formColumn}>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
