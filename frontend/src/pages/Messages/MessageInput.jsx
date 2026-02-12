// frontend\src\pages\Messages\MessageInput.jsx
import React, { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import s from "./Messages.module.scss";

const MessageInput = ({ onSendMessage }) => {
  const [text, setText] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const pickerRef = useRef(null);

  const onEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
  };

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text);
      setText("");
      setShowPicker(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={s.inputContainer}>
      <button
        type="button"
        className={s.emojiBtn}
        onClick={() => setShowPicker(!showPicker)}
      >
        😀
      </button>

      {showPicker && (
        <div className={s.emojiPickerWrapper} ref={pickerRef}>
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            searchDisabled={true}
            skinTonesDisabled={true}
            previewConfig={{ showPreview: false }}
            height={300}
            width={280}
            emojiStyle="native"
          />
        </div>
      )}

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Message..."
        className={s.inputField}
        onKeyPress={(e) => e.key === "Enter" && handleSend()}
      />

      {text.trim() && (
        <button onClick={handleSend} className={s.sendBtn}>
          Send
        </button>
      )}
    </div>
  );
};

export default MessageInput;
