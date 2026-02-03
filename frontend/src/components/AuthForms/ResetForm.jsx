import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { BiLockAlt } from "react-icons/bi"; 
import { useResetPasswordMutation, useResetPasswordStep2Mutation } from '../../services/api';
import s from './AuthForms.module.scss';
import p from '../../pages/Pages.module.scss'; 

export const ResetForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useParams(); 

  const isStepOne = location.pathname === '/reset';

  const [sendResetLink, { isLoading: isSending }] = useResetPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordStep2Mutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset 
  } = useForm({ mode: 'onBlur' });

  const onSubmitStep1 = async (data) => {
    try {
      const response = await sendResetLink({ emailOrUsername: data.emailOrUsername }).unwrap();
      toast.success("Code sent! Check your email.");
      reset();
      navigate(`/reset-password/${response.username}`);
    } catch (err) {
      console.error(err);
      toast.error(err.data?.message || "User not found");
    }
  };

  const onSubmitStep2 = async (data) => {
    try {
      const payload = {
        username: username, 
        code: data.code,
        password: data.password
      };
      
      await resetPassword(payload).unwrap();
      toast.success("Password changed! Please log in.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(err.data?.message || "Invalid code or error");
    }
  };

  return (
    <div className={p.screenWrapper}>
      <div className={p.formColumn}>
        
        {/* обертка div. 
           Она нужна, чтобы игнорировать gap: 10px родителя и склеить блоки.
        */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          
          {/* Верхний блок: Карточка */}
          {/* Убираем нижние радиусы, чтобы стык был ровным */}
          <div className={s.resetCard} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
            <div className={s.lock}>
               <BiLockAlt size={32} color="#262626" />
            </div>

            <h2 style={{fontSize: '16px', fontWeight: '600', marginBottom: '10px', color: '#262626'}}>
              {isStepOne ? "Trouble logging in?" : "Create New Password"}
            </h2>

            <p className={s.descriptionR}>
              {isStepOne 
                ? "Enter your email or username and we'll send you a code to get back into your account."
                : "Enter the 6-digit code from your email and create a new password."
              }
            </p>

            <form className={s.formStack} onSubmit={handleSubmit(isStepOne ? onSubmitStep1 : onSubmitStep2)}>
              
              {isStepOne && (
                <div style={{width: '100%'}}>
                  <input
                    style={{width: '100%', padding: '9px 8px', border: '1px solid #dbdbdb', borderRadius: '3px', backgroundColor: '#fafafa', fontSize: '12px', outline: 'none'}}
                    placeholder="Email or Username"
                    type="text"
                    {...register("emailOrUsername", { required: "Field is required" })}
                  />
                  {errors.emailOrUsername && <p className={s.errorMsg}>{errors.emailOrUsername.message}</p>}
                </div>
              )}

              {!isStepOne && (
                <>
                  <div style={{width: '100%'}}>
                    <input
                      style={{width: '100%', padding: '9px 8px', border: '1px solid #dbdbdb', borderRadius: '3px', backgroundColor: '#fafafa', fontSize: '12px', outline: 'none'}}
                      autoComplete="off"
                      placeholder="Security Code (6 digits)"
                      type="text"
                      {...register("code", { required: "Code is required" })}
                    />
                    {errors.code && <p className={s.errorMsg}>{errors.code.message}</p>}
                  </div>

                  <div style={{width: '100%'}}>
                    <input
                      style={{width: '100%', padding: '9px 8px', border: '1px solid #dbdbdb', borderRadius: '3px', backgroundColor: '#fafafa', fontSize: '12px', outline: 'none'}}
                      autoComplete="new-password"
                      placeholder="New Password"
                      type="password"
                      {...register("password", { 
                        required: "Password is required",
                        minLength: { value: 6, message: "Min 6 chars" }
                      })}
                    />
                    {errors.password && <p className={s.errorMsg}>{errors.password.message}</p>}
                  </div>
                </>
              )}

              <button className={s.submitBtn} type="submit" disabled={isSending || isResetting}>
                {isStepOne ? "Send Login Link" : "Reset Password"}
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

          {/* Нижний блок: Кнопка назад */}
          <Link to="/login" className={s.loginLinkR}>
            Back to Login
          </Link>

        </div> 
        {/* Конец обертки */}

      </div>
      
      <Toaster position="top-center" />
    </div>
  );
};