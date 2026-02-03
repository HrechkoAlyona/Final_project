import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useLoginMutation } from '../../services/api';
import LogoIchgram from '../../components/logos/LogoIchgram';
import s from './AuthForms.module.scss'; // Стили компонентов (кнопки, инпуты)
import p from '../../pages/Pages.module.scss'; // Стили разметки (центровка)
import phonesImg from '../../assets/images/home-phones.png'; // Картинка

const LoginForm = () => {
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onBlur' });

  const onSubmit = async (data) => {
    try {
      const result = await loginUser(data).unwrap();
      
      if (result.token) {
        localStorage.setItem('token', result.token);
        toast.success('Welcome back!');
        navigate('/');
        window.location.reload(); 
      }
    } catch (err) {
      toast.error(err.data?.message || 'Login failed. Try again.');
    }
  };

  return (
    // обертка
    <div className={p.screenWrapper}>
      
      {/* Ряд с контентом */}
      <div className={p.contentRow}>
        
        {/* Картинка слева */}
        <div className={p.previewSection}>
          <img src={phonesImg} alt="App Screens" />
        </div>

        {/* Колонка справа (форма) */}
        <div className={p.formColumn}>
          
          {/* Карточка входа */}
          <div className={s.authCard}>
            <div className={s.logo}>
               <LogoIchgram />
            </div>

            <form className={s.formStack} onSubmit={handleSubmit(onSubmit)}>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                  })}
                />
                {errors.email && <p className={s.errorMsg}>{errors.email.message}</p>}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  {...register('password', { required: 'Password is required' })}
                />
                {errors.password && <p className={s.errorMsg}>{errors.password.message}</p>}
              </div>

              <button className={s.submitBtn} type="submit" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Log In'}
              </button>

              <div className={s.divider}>
                <div className={s.line}></div>
                <div className={s.orText}>OR</div>
                <div className={s.line}></div>
              </div>

              <Link to="/reset" style={{ fontSize: '12px', color: '#00376b', textDecoration: 'none', marginTop: '12px', textAlign: 'center', display: 'block' }}>
                Forgot password?
              </Link>
            </form>
          </div>

          {/* Блок переключения на регистрацию */}
          <div className={s.switchBox}>
            <p>
              <span>Don't have an account?</span>
              <Link to="/register">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default LoginForm;