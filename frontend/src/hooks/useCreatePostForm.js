// frontend/src/hooks/useCreatePostForm.js

import { useState, useContext, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useCreatePostMutation } from '../services/api';
import { NavigationContext } from '../context/NavigationContext';

export const useCreatePostForm = (onClose) => {
  const { setIsDrawerOpen } = useContext(NavigationContext);
  const navigate = useNavigate();
  
  const [showEmoji, setShowEmoji] = useState(false);
  const [preview, setPreview] = useState(null);
  
  // не активное поле
const [activeField, setActiveField] = useState(null); 

  const [createPost, { isLoading }] = useCreatePostMutation();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    reset,
  } = useForm({
    defaultValues: {
      title: '',       
      content: '',     
      image: null
    }
  });

  const captionValue = useWatch({ control, name: 'content', defaultValue: '' });
  const titleValue = useWatch({ control, name: 'title', defaultValue: '' });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setValue('image', file);
    }
  };

  // ФУНКЦИЯ: Принимает specificField
  const onEmojiClick = (emojiData, specificField) => {
    // Если передали конкретное поле (например 'content'), используем его.
    // Если нет, берем текущее активное поле из стейта.
    const targetField = specificField || activeField;

    const currentValue = getValues(targetField) || "";
    setValue(targetField, currentValue + emojiData.emoji, { 
        shouldValidate: true, 
        shouldDirty: true 
    });
  };

  const submitPost = async (data) => {
    const toastId = toast.loading("Sharing post...");
    
    try {
      if (!data.image) {
        toast.error("Please select an image", { id: toastId });
        return;
      }

      const formData = new FormData();
      formData.append("image", data.image);
      formData.append("description", data.content || ""); 
      formData.append("title", data.title || ""); 

      await createPost(formData).unwrap();
      toast.success("Post shared!", { id: toastId });
      
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = token.split('.')[1];
          const userId = JSON.parse(atob(payload)).id;
          if (userId) navigate(`/profile/${userId}`);
        } catch (e) { console.error(e); }
      }

      reset();
      setPreview(null);
      if (onClose) onClose();
      setIsDrawerOpen(false); 
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Failed to share post", { id: toastId });
    }
  };

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const resetForm = () => {
    setPreview(null);
    setValue('content', '');
    setValue('title', '');
    setValue('image', null);
  };

  return {
    register,
    handleSubmit,
    control,
    isLoading,
    preview,
    captionValue,
    titleValue,
    showEmoji,     
    setShowEmoji,
    handleFileSelect,
    onEmojiClick,
    submitPost,
    resetForm,
    activeField,
    setActiveField 
  };
};