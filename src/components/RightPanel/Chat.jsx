import React from "react";
import "./Chat.css";

function Chat({ messages }) {
  return (
    <div className="chat-container">
      {/* Контейнер для сообщений */}
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className="message">
            <strong>{message.user}:</strong> {message.text}
          </div>
        ))}
      </div>

      {/* Контейнер для ввода и кнопок */}
      <div className="chat-input-container">
        <input
          type="text"
          placeholder="Введите сообщение"
          className="chat-input"
        />
        <button className="send-button">Отправить</button>
      </div>
    </div>
  );
}

export default Chat;
