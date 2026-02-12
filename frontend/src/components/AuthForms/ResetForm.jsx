// frontend\src\components\AuthForms\ResetForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { AiOutlineLock } from 'react-icons/ai'; 
import { useResetPasswordMutation, useResetPasswordStep2Mutation } from '../../services/api';
import s from './AuthForms.module.scss'; 

const ResetForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Состояние шагов
  const [targetUsername, setTargetUsername] = useState('');
  const [resetStep1, { isLoading: isLoading1 }] = useResetPasswordMutation();
  const [resetStep2, { isLoading: isLoading2 }] = useResetPasswordStep2Mutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset 
  } = useForm({ mode: 'onBlur' });

  //  ШАГ 1: Отправка Email или Username 
  const onStep1Submit = async (data) => {
    try {
      // 1. Отправляем запрос
      const response = await resetStep1({ emailOrUsername: data.emailOrUsername }).unwrap();
      
      console.log("Ответ сервера (Шаг 1):", response);

      // 2. Сервер возвращает username найденного пользователя. Сохраняем его
      if (response.username) {
        setTargetUsername(response.username);
      } else {
        // Если сервер не вернул (на всякий случай), сохраняем то, что ввели
        setTargetUsername(data.emailOrUsername);
      }

      setStep(2);
      reset(); // Очистить поля
      toast.success('Code sent! Check server terminal.');
    } catch (err) {
      console.error(err);
      toast.error(err.data?.message || 'Error sending code');
    }
  };

  //  ШАГ 2: Смена пароля 
  const onStep2Submit = async (data) => {
    try {
      console.log("Отправляем на Шаг 2:", {
          username: targetUsername,
          code: data.resetCode,
          password: data.newPassword
      });

      // ОТПРАВЛЯЕМ ТОЧНО ТЕ ПОЛЯ, КОТОРЫЕ ЖДЕТ КОНТРОЛЛЕР
      await resetStep2({
        username: targetUsername, // <-- БЕРЕМ ИЗ СТЕЙТА
        code: data.resetCode,     // <-- ИЗ ФОРМЫ (поле name="resetCode")
        password: data.newPassword // <-- ИЗ ФОРМЫ (поле name="newPassword")
      }).unwrap();
      
      toast.success('Password changed successfully!');
      navigate('/login');
    } catch (err) {
      console.error("Ошибка Шага 2:", err);
      toast.error(err.data?.message || 'Failed to reset password');
    }
  };

  return (
    <>
      <div className={s.resetCard}> 
        <div className={s.lock}>
           <AiOutlineLock size={30} />
        </div>

        <h3>Trouble Logging In?</h3>
        
        <p className={s.descriptionR}>
          {step === 1 
            ? "Enter your email or username to receive a recovery code."
            : `Enter the code sent to "${targetUsername}" and your new password.`
          }
        </p>

        <form className={s.formStack} onSubmit={handleSubmit(step === 1 ? onStep1Submit : onStep2Submit)}>
 
          {step === 1 && (
            <div>
              <input
                type="text"
                placeholder="Email or Username"
                {...register('emailOrUsername', { 
                  required: 'Email or Username is required'
                })}
              />
              {errors.emailOrUsername && <p className={s.errorMsg}>{errors.emailOrUsername.message}</p>}
            </div>
          )}

          {step === 2 && (
            <>
              <div>
                <input
                  type="text"
                  placeholder="Security Code (from terminal)"
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

      <Link to="/login" className={s.loginLinkR}>
        Back to Login
      </Link>
      
      <Toaster position="top-center" />
    </>
  );
};

export default ResetForm;