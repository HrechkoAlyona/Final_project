// frontend\src\pages\Auth\Register.jsx

import React from "react";
import RegisterForm from "../../components/AuthForms/RegisterForm";
import s from "./AuthPage.module.scss";
import phonesImg from "../../assets/images/home-phones.png";

const Register = () => {
  return (
    <div className={s.screenWrapper}>
      <div className={s.contentRow}>
        <div className={s.previewSection}>
          <img src={phonesImg} alt="phones" />
        </div>

        <div className={s.formColumn}>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default Register;
