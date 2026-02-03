import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useRegisterUserMutation } from '../../services/api'; 
import LogoIchgram from '../../components/logos/LogoIchgram'; 
import s from './AuthForms.module.scss';
import p from '../../pages/Pages.module.scss'; // Уникальные стили страницы

const RegisterForm = () => {
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterUserMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onBlur' });

  const onSubmit = async (data) => {
    try {
      const userData = {
        email: data.email,
        fullName: data.fullName,
        username: data.username,
        password: data.password,
      };

      await registerUser(userData).unwrap();
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error(err.data?.message || 'Registration failed');
    }
  };

  return (
    // Обертка экрана
    <div className={p.screenWrapper}>
      
      {/* Колонка шириной 350px */}
      <div className={p.formColumn}>
        
        {/* ВЕРХНИЙ БЛОК: Форма регистрации */}
        <div className={s.authCard}>
          <div className={s.logo}>
              <LogoIchgram />
          </div>
          
          <p className={s.subText}>
            Sign up to see photos and videos from your friends.
          </p>

          <form className={s.formStack} onSubmit={handleSubmit(onSubmit)}>
             <div>
              <input
                placeholder="Email"
                type="text"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                })}
              />
              {errors.email && <p className={s.errorMsg}>{errors.email.message}</p>}
            </div>

            <div>
              <input
                placeholder="Full Name"
                type="text"
                {...register('fullName', { required: 'Full Name is required' })}
              />
              {errors.fullName && <p className={s.errorMsg}>{errors.fullName.message}</p>}
            </div>

            <div>
              <input
                placeholder="Username"
                type="text"
                {...register('username', { required: 'Username is required' })}
              />
              {errors.username && <p className={s.errorMsg}>{errors.username.message}</p>}
            </div>

            <div>
              <input
                placeholder="Password"
                type="password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Min 6 characters' }
                })}
              />
              {errors.password && <p className={s.errorMsg}>{errors.password.message}</p>}
            </div>

            <div className={s.legalInfo}>
              <p>
                By signing up, you agree to our <Link to="/">Terms</Link>, <Link to="/">Privacy Policy</Link> and <Link to="/">Cookie Policy</Link>.
              </p>
            </div>

            <button className={s.submitBtn} type="submit" disabled={isLoading}>
              {isLoading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>
        </div>

        {/* НИЖНИЙ БЛОК: Переход на логин  */}
        <div className={s.switchBox}>
          <p>
            <span>Have an account?</span>
            <Link to="/login">Log in</Link>
          </p>
        </div>

      </div> 
      <Toaster />
    </div>
  );
};

export default RegisterForm;