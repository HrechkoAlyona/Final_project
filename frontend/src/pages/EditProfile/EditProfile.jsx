import React from 'react';
import { useForm, useWatch } from 'react-hook-form'; // Импортируем useWatch
import { toast } from 'react-hot-toast';
import { useGetUserByIdQuery, useUpdateProfileMutation } from '../../services/api';
import s from './EditProfile.module.scss';

const EditProfile = () => {
  const userId = localStorage.getItem('userId');
  const { data: user, isLoading } = useGetUserByIdQuery(userId);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  // 1. ОДИН раз вызываем useForm и достаем всё, что нужно (включая control)
  const { register, handleSubmit, setValue, control } = useForm();

  // 2. Используем useWatch для отслеживания аватара (безопасно для React Compiler)
  const avatarPreview = useWatch({
    control,
    name: "avatar",
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setValue('avatar', reader.result);
    };
    if (file) reader.readAsDataURL(file);
  };

  if (isLoading) return <div className={s.loader}>Loading...</div>;

  return (
    <div className={s.pageWrapper}>
      <div className={s.container}>
        <h1 className={s.mainTitle}>Edit profile</h1>

        {/* Блок аватара */}
        <div className={s.avatarCard}>
          <div className={s.avatarInfo}>
            {/* 3. ИСПОЛЬЗУЕМ avatarPreview ВМЕСТО watch("avatar") */}
            <img 
              src={avatarPreview || user?.avatar || "https://via.placeholder.com/150"} 
              alt="avatar" 
              className={s.avatarImg}
            />
            <div className={s.avatarTexts}>
              <span className={s.usernameDisplay}>{user?.username}</span>
              <span className={s.avatarSubtext}>Change profile photo</span>
            </div>
          </div>
          <label className={s.newPhotoBtn}>
            New photo
            <input type="file" onChange={handleImageChange} accept="image/*" hidden />
          </label>
        </div>

        {/* Форма с полями */}
        <form onSubmit={handleSubmit(async (data) => {
          try {
            // Отправляем данные на бэкенд
            await updateProfile(data).unwrap();
            toast.success('Profile updated!');
          
          
          
          } catch (err) {
            console.error("Ошибка при обновлении:", err); // 1. Логируем ошибку (переменная использована!)
            
            // 2. Пытаемся показать реальную причину ошибки от бэкенда или дефолтный текст
            const errorMessage = err.data?.message || 'Update failed';
            toast.error(errorMessage);
        }
        })} className={s.form}>
          
          <div className={s.inputGroup}>
            <label>Username</label>
            <input {...register('username')} defaultValue={user?.username} />
          </div>

          <div className={s.inputGroup}>
            <label>Website</label>
            <div className={s.linkInputWrapper}>
              <span className={s.linkIcon}>🔗</span>
              <input {...register('website')} defaultValue={user?.website} placeholder="bit.ly/yourlink" />
            </div>
          </div>

          <div className={s.inputGroup}>
            <label>About</label>
            <div className={s.textareaWrapper}>
              <textarea 
                {...register('bio')} 
                defaultValue={user?.bio} 
                maxLength={150}
              />
              <span className={s.charCount}>
                {user?.bio?.length || 0} / 150
              </span>
            </div>
          </div>

          <button type="submit" className={s.saveBtn} disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;