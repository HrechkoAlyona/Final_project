// frontend\src\pages\Messages\MessageInput.jsx

import React, { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import { BiSmile } from "react-icons/bi"; 
import s from "./Messages.module.scss";

const MessageInput = ({ onSendMessage }) => {
  const [text, setText] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);
  const buttonRef = useRef(null); // Реф для кнопки смайлика

  const onEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
    // Не закрываем пикер, чтобы можно было выбрать несколько смайлов
  };

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text);
      setText("");
      setShowPicker(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // Закрытие смайликов при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target) // Игнорируем клик по самой кнопке смайла
      ) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={s.inputContainer}>
      {/* Кнопка смайликов */}
      <button
        ref={buttonRef}
        type="button"
        className={s.emojiBtn}
        onClick={() => setShowPicker(!showPicker)}
      >
        <BiSmile /> 
      </button>

      {/* Окно с эмодзи */}
      {showPicker && (
        <div className={s.emojiPickerWrapper} ref={pickerRef}>
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            searchDisabled={true}
            skinTonesDisabled={true}
            previewConfig={{ showPreview: false }}
            height={350}
            width={300}
            emojiStyle="native"
          />
        </div>
      )}

      {/* Поле ввода */}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Message..."
        className={s.inputField}
        onKeyDown={handleKeyDown} 
      />

      {/* Кнопка "Send" появляется ТОЛЬКО когда есть текст */}
      {text.trim().length > 0 && (
        <button onClick={handleSend} className={s.sendBtn}>
          Send
        </button>
      )}
    </div>
  );
};

export default MessageInput;                    