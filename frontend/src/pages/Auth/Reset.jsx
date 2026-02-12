// frontend/src/pages/Auth/Reset.jsx
import React from "react";
import ResetForm from "../../components/AuthForms/ResetForm";

import s from "./AuthPage.module.scss"; // Подключаем стили страницы

const Reset = () => {
  return (
    <div className={s.screenWrapper}>
      {/* Центрируем форму сброса пароля */}
      <div className={s.formColumn} style={{ margin: "0 auto" }}>
        <ResetForm />
      </div>
    </div>
  );
};

export default Reset;
