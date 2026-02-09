// frontend\src\components\AuthForms\ResetForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { AiOutlineLock } from 'react-icons/ai'; // Иконка замка
import { useResetPasswordMutation, useResetPasswordStep2Mutation } from '../../services/api';
import s from './AuthForms.module.scss'; // Только стили формы

const ResetForm = () => {
  const navigate = useNavigate();
  
  // Состояние: Шаг 1 (Ввод email) или Шаг 2 (Ввод кода и нового пароля)
  const [step, setStep] = useState(1);
  // Сохраняем email для второго шага
  const [emailForReset, setEmailForReset] = useState('');

  const [resetStep1, { isLoading: isLoading1 }] = useResetPasswordMutation();
  const [resetStep2, { isLoading: isLoading2 }] = useResetPasswordStep2Mutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset // функция сброса полей формы
  } = useForm({ mode: 'onBlur' });

  // --- ШАГ 1: Отправка Email ---
  const onStep1Submit = async (data) => {
    try {
      await resetStep1({ email: data.email }).unwrap();
      setEmailForReset(data.email);
      setStep(2);
      reset(); // Очищаем форму
      toast.success('Code sent to your email');
    } catch (err) {
      toast.error(err.data?.message || 'Error sending code');
    }
  };

  // --- ШАГ 2: Смена пароля ---
  const onStep2Submit = async (data) => {
    try {
      await resetStep2({
        email: emailForReset,
        resetCode: data.resetCode,
        newPassword: data.newPassword
      }).unwrap();
      
      toast.success('Password changed successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to reset password');
    }
  };

  return (
    <>
      <div className={s.resetCard}> {/* Используем класс resetCard из AuthForms.module.scss */}
        
        {/* Иконка замка */}
        <div className={s.lock}>
           <AiOutlineLock size={30} />
        </div>

        <h3>Trouble Logging In?</h3>
        
        <p className={s.descriptionR}>
          {step === 1 
            ? "Enter your email and we'll send you a code to get back into your account."
            : "Enter the code sent to your email and create a new password."
          }
        </p>

        <form className={s.formStack} onSubmit={handleSubmit(step === 1 ? onStep1Submit : onStep2Submit)}>
          
          {/* ПОЛЯ ДЛЯ ШАГА 1 */}
          {step === 1 && (
            <div>
              <input
                type="email"
                placeholder="Email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                })}
              />
              {errors.email && <p className={s.errorMsg}>{errors.email.message}</p>}
            </div>
          )}

          {/* ПОЛЯ ДЛЯ ШАГА 2 */}
          {step === 2 && (
            <>
              <div>
                <input
                  type="text"
                  placeholder="Security Code"
                  {...register('resetCode', { required: 'Code is required' })}
                />
                {errors.resetCode && <p className={s.errorMsg}>{errors.resetCode.message}</p>}
              </div>
              <div>
                <input
                  type="password"
                  placeholder="New Password"
                  {...register('newPassword', { 
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Min 6 characters' }
                  })}
                />
                {errors.newPassword && <p className={s.errorMsg}>{errors.newPassword.message}</p>}
              </div>
            </>
          )}

          <button className={s.submitBtn} type="submit" disabled={isLoading1 || isLoading2}>
            {step === 1 
              ? (isLoading1 ? 'Sending...' : 'Send Login Link') 
              : (isLoading2 ? 'Resetting...' : 'Reset Password')
            }
          </button>
        </form>

        <div className={s.divider}>
          <div className={s.line}></div>
          <div className={s.orText}>OR</div>
          <div className={s.line}></div>
        </div>

        <Link to="/register" className={s.registerLinkR}>
           Create New Account
        </Link>
      </div>

      {/* Кнопка "Back to Login" внизу */}
      <Link to="/login" className={s.loginLinkR}>
        Back to Login
      </Link>
      
      <Toaster position="top-center" />
    </>
  );
};

export default ResetForm;