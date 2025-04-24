import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const messagesEndRef = useRef(null);

  // Загружаем сообщения из localStorage при монтировании компонента
  useEffect(() => {
    const storedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    setMessages(storedMessages);
  }, []);

  // Сохраняем сообщения в localStorage при изменении сообщений
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  const handleSend = () => {
    if (!text && !media) return;

    const newMessage = {
      user: "Вы",
      text,
      media,
    };

    setMessages((prev) => [...prev, newMessage]);
    setText("");
    setMedia(null);
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setMedia({ url: fileUrl, name: file.name, type: file.type });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.user !== "Вы" ? "message-other" : "message-self"}`}
          >
            <strong>{message.user}:</strong> {message.text}
            {message.media && (
              <div className="media-preview">
                {message.media.type.startsWith("image") ? (
                  <img src={message.media.url} alt="media" />
                ) : (
                  <video src={message.media.url} controls />
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          placeholder="Введите сообщение"
          className="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <label className="media-button">
          📎
          <input type="file" accept="image/*,video/*" onChange={handleMediaChange} hidden />
        </label>
        <button className="send-button" onClick={handleSend}>
          Отправить
        </button>
      </div>
    </div>
  );
}

export default Chat;
