import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom"; 
import {
  useGetUserByIdQuery,
  useUpdateProfileMutation,
} from "../../services/api";
import s from "./EditProfile.module.scss";

const EditProfile = () => {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate(); 

  const { data: user, isLoading } = useGetUserByIdQuery(userId, {
    refetchOnMountOrArgChange: true,
  });

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const { register, handleSubmit, setValue, control, reset } = useForm({
    defaultValues: {
      username: "",
      website: "",
      bio: "",
      avatar: "",
    },
  });

  const watchedValues = useWatch({
    control,
    name: ["avatar", "bio"],
  });
  const avatarPreview = watchedValues[0];
  const bioValue = watchedValues[1] || "";

  useEffect(() => {
    if (user) {
      reset({
        username: user.username || "",
        website: user.website || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
      });
    }
  }, [user, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("avatar", reader.result, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Отправляем данные на сервер
      await updateProfile({
        ...data,
        _id: userId,
      }).unwrap();

      toast.success("Profile updated!");
      
      // Используем setTimeout, чтобы пользователь успел увидеть уведомление toast
      setTimeout(() => {
        navigate(`/profile/${userId}`);
      }, 1000); 

    } catch (err) {
      console.error("Ошибка при обновлении:", err);
      const errorMessage = err.data?.message || err.error || "Update failed";
      toast.error(errorMessage);
    }
  };

  if (isLoading) return <div className={s.pageWrapper}>Loading...</div>;

  return (
    <div className={s.pageWrapper}>
      <div className={s.container}>
        <h1 className={s.mainTitle}>Edit profile</h1>

        {/* Аватарка */}
        <div className={s.avatarCard}>
          <div className={s.avatarInfo}>
            <img
              src={
                avatarPreview ||
                user?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
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
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              hidden
            />
          </label>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit(onSubmit)} className={s.form}>
          <div className={s.inputGroup}>
            <label>Username</label>
            <input {...register("username")} placeholder="Username" />
          </div>

          <div className={s.inputGroup}>
            <label>Website</label>
            <div className={s.linkInputWrapper}>
              <span className={s.linkIcon}>🔗</span>
              <input {...register("website")} placeholder="bit.ly/yourlink" />
            </div>
          </div>

          <div className={s.inputGroup}>
            <label>About</label>
            <div className={s.textareaWrapper}>
              <textarea
                {...register("bio")}
                maxLength={150}
                placeholder="Write something about yourself..."
              />
              <span className={s.charCount}>
                {bioValue.length} / 150
              </span>
            </div>
          </div>

          <button type="submit" className={s.saveBtn} disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;