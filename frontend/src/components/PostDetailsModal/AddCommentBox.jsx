import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form'; // 1. Импортируем useWatch
import EmojiPicker from 'emoji-picker-react';
import { AiOutlineSmile } from 'react-icons/ai';
import s from './PostDetailsModal.module.scss';

const AddCommentBox = ({ postId }) => {
  const [showEmoji, setShowEmoji] = useState(false);
  
  // 2. Достаем control
  const { register, handleSubmit, setValue, control } = useForm();
  
  // 3. Используем безопасный useWatch
  const commentText = useWatch({
    control,
    name: 'comment',
    defaultValue: ''
  });

  const onEmojiClick = (emojiData) => {
    // Безопасно добавляем смайлик к тексту
    setValue('comment', commentText + emojiData.emoji);
    setShowEmoji(false);
  };

  const onSubmit = (data) => {
    // 4. Используем postId, чтобы линтер не ругался
    console.log(`Sending comment to post ${postId}:`, data.comment);
    setValue('comment', '');
  };

  return (
    <form className={s.commentForm} onSubmit={handleSubmit(onSubmit)}>
      {showEmoji && (
        <div style={{ position: 'absolute', bottom: '60px', zIndex: 10 }}>
           <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={300} />
        </div>
      )}
      
      <div className={s.emojiBtn} onClick={() => setShowEmoji(!showEmoji)}>
        <AiOutlineSmile />
      </div>

      <input 
        type="text" 
        placeholder="Add a comment..." 
        autoComplete="off"
        // Регистрируем поле
        {...register('comment', { required: true })}
      />

      <button 
        type="submit" 
        className={s.postBtn} 
        // Кнопка активна, только если есть текст
        disabled={!commentText.trim()}
      >
        Post
      </button>
    </form>
  );
};

export default AddCommentBox;