// frontend\src\pages\EditProfile\EditProfile.jsx

import React, { useEffect } from 'react'; // 1. Добавляем useEffect
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useGetUserByIdQuery, useUpdateProfileMutation } from '../../services/api';
import s from './EditProfile.module.scss';

const EditProfile = () => {
  const userId = localStorage.getItem('userId');
  
  // Получаем данные. refetchOnMountOrArgChange гарантирует, что мы видим свежие данные
  const { data: user, isLoading } = useGetUserByIdQuery(userId, {
    refetchOnMountOrArgChange: true, 
  });
  
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  // 2. Достаем reset из useForm
  const { register, handleSubmit, setValue, control, reset } = useForm({
    defaultValues: {
      username: '',
      website: '',
      bio: '',
      avatar: ''
    }
  });

  // 3. ГЛАВНОЕ ИСПРАВЛЕНИЕ: Синхронизируем форму с данными, когда они пришли
  useEffect(() => {
    if (user) {
      reset({
        username: user.username || '',
        website: user.website || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
    }
  }, [user, reset]);

  const avatarPreview = useWatch({
    control,
    name: "avatar",
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('avatar', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) return <div className={s.loader}>Loading...</div>;

  const onSubmit = async (data) => {
    try {
      await updateProfile({
        ...data,
        _id: userId // На всякий случай передаем ID, если бэкенд его ждет в теле
      }).unwrap();
      
      toast.success('Profile updated!');
    } catch (err) {
      console.error("Ошибка при обновлении:", err);
      const errorMessage = err.data?.message || 'Update failed';
      toast.error(errorMessage);
    }
  };

  return (
    <div className={s.pageWrapper}>
      <div className={s.container}>
        <h1 className={s.mainTitle}>Edit profile</h1>

        <div className={s.avatarCard}>
          <div className={s.avatarInfo}>
            <img 
              // Логика: Сначала то, что в форме (если загрузили новое), иначе то, что пришло с сервера
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

        <form onSubmit={handleSubmit(onSubmit)} className={s.form}>
          
          <div className={s.inputGroup}>
            <label>Username</label>
            {/* defaultValue больше не нужен, так как работает reset */}
            <input {...register('username')} placeholder="Username" />
          </div>

          <div className={s.inputGroup}>
            <label>Website</label>
            <div className={s.linkInputWrapper}>
              <span className={s.linkIcon}>🔗</span>
              <input {...register('website')} placeholder="bit.ly/yourlink" />
            </div>
          </div>

          <div className={s.inputGroup}>
            <label>About</label>
            <div className={s.textareaWrapper}>
              <textarea 
                {...register('bio')} 
                maxLength={150}
                placeholder="Write something about yourself..."
              />
              <span className={s.charCount}>
                {/* Следим за длиной введенного текста, а не старых данных */}
                {(control._formValues.bio || "").length} / 150
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