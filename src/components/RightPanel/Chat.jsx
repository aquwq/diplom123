import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";

function Chat({ messages, setMessages, currentChannel }) {
  const [input, setInput] = useState("");
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  // Отправка сообщения
  const sendMessage = () => {
    if (input.trim() && ws.current.readyState === WebSocket.OPEN) {
      const messageData = { message: input };
      ws.current.send(JSON.stringify(messageData));
      setInput("");
    }
  };

  // Отправка по Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // WebSocket подключение
  useEffect(() => {
    if (!currentChannel) return;

    const token = localStorage.getItem("access");
    const socket = new WebSocket(
      `ws://localhost:8000/ws/communication/channels/${currentChannel}/?token=${token}`
    );
    ws.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "chat_message") {
        setMessages((prevMessages) => {
          const isDuplicate = prevMessages.some(
            (message) => message.text === data.message
          );

          if (!isDuplicate) {
            return [
              ...prevMessages,
              {
                user: data.sender,
                text: data.message,
              },
            ];
          }
          return prevMessages;
        });
      }
    };

    socket.onerror = (e) => {
      console.error("Ошибка WebSocket:", e);
    };

    return () => {
      socket.close();
    };
  }, [currentChannel, setMessages]);

  // Автопрокрутка
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.user === "Вы" ? "message-self" : "message-other"
            }`}
          >
            <strong>{message.user}:</strong> {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <button className="media-button" title="Прикрепить файл">
          📎
        </button>
        <input
          type="text"
          placeholder="Введите сообщение"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="send-button" onClick={sendMessage}>
          Отправить
        </button>
      </div>
    </div>
  );
}

export default Chat;
