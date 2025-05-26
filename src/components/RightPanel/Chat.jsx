import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";

function Chat({ currentChannel, messages, setMessages }) {
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Получаем инфу о текущем пользователе
  const fetchUserName = async () => {
    const token = localStorage.getItem("access");
    if (token) {
      try {
        const res = await fetch("http://localhost:8000/accounts/api/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUserName(data.name);
          setUserId(data.id);
        }
      } catch (err) {
        console.error("Ошибка при получении пользователя:", err);
      }
    }
  };

  // Формат имени, например: Иван И.
  const formatUserName = (fullName) => {
    const parts = fullName.split(" ");
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1].charAt(0)}.`;
    }
    return fullName;
  };

  // Загружаем историю сообщений при смене канала
  const fetchMessages = async (channelId) => {
    if (!channelId) return;
    const token = localStorage.getItem("access");
    try {
      const res = await fetch(`http://localhost:8000/communication/channels/${channelId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Преобразуем сообщения, добавим senderDisplayName
        const msgs = data.messages.map((msg) => ({
          ...msg,
          senderDisplayName:
            msg.sender.id === userId ? "Вы" : formatUserName(msg.sender.name),
        }));
        setMessages(msgs);
      }
    } catch (err) {
      console.error("Ошибка загрузки сообщений:", err);
    }
  };

  // Отправка сообщения
  const sendMessage = async () => {
    if (!input.trim() && !file) return;

    let uploadedFile = null;

    if (file) {
      uploadedFile = await uploadFile(file);
      if (!uploadedFile) {
        alert("Ошибка загрузки файла");
        return;
      }
    }

    const msgData = {
      message: input,
      sender: userName,
      file_path: uploadedFile ? uploadedFile.path : null,
      file_name: uploadedFile ? uploadedFile.file_name : null,
    };

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msgData));
      setInput("");
      setFile(null);
    } else {
      alert("Соединение с сервером потеряно");
    }
  };

  // Загрузка файла на сервер
  const uploadFile = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("access");

    try {
      const res = await fetch("http://localhost:8000/communication/upload/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      setUploading(false);
      if (res.ok) {
        const data = await res.json();
        return { path: data.path, file_name: data.file_name || file.name };
      }
      return null;
    } catch (err) {
      setUploading(false);
      console.error("Ошибка загрузки файла:", err);
      return null;
    }
  };

  // Обработчик клавиш для отправки по Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Скачать файл по ссылке
  const downloadFile = async (url, filename) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Ошибка скачивания");
      const blob = await res.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlBlob;
      a.download = filename || "file";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlBlob);
    } catch (err) {
      console.error(err);
      alert("Не удалось скачать файл");
    }
  };

  // Инициализация пользователя и загрузка сообщений при смене канала
  useEffect(() => {
    fetchUserName();
  }, []);

  useEffect(() => {
    if (!currentChannel) return;
    fetchMessages(currentChannel);
  }, [currentChannel, userId]);

  // WebSocket для получения новых сообщений
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
        const msg = data.message;
        const senderDisplayName =
          msg.sender.id === userId ? "Вы" : formatUserName(msg.sender.name);

        setMessages((prev) => {
          // Предотвратить дубликаты
          if (
            prev.some(
              (m) =>
                m.timestamp === msg.timestamp &&
                m.sender.id === msg.sender.id &&
                m.content === msg.content
            )
          ) {
            return prev;
          }
          return [...prev, { ...msg, senderDisplayName }];
        });
      }
    };

    socket.onerror = (e) => console.error("WebSocket error:", e);

    return () => {
      socket.close();
    };
  }, [currentChannel, userId, setMessages]);

  // Автопрокрутка к новому сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${
              msg.senderDisplayName === "Вы" ? "message-self" : "message-other"
            }`}
          >
            <div className="message-content">
              <strong>{msg.senderDisplayName}:</strong>
              <p>{msg.content}</p>
            </div>
            <div className="message-meta">
              <small>{new Date(msg.timestamp).toLocaleString()}</small>
            </div>

            {msg.uploaded_file && (
              <div className="attached-file">
                <button
                  className="file-download-button"
                  onClick={() =>
                    downloadFile(msg.uploaded_file.url, msg.uploaded_file.file_name)
                  }
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    margin: 0,
                    color: "blue",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "inherit",
                    fontFamily: "inherit",
                  }}
                >
                  📎 {msg.uploaded_file.file_name}
                </button>
                {msg.uploaded_file.is_image && (
                  <div className="file-preview-image">
                    <img
                      src={msg.uploaded_file.url}
                      alt="preview"
                      style={{ maxWidth: "200px", marginTop: "8px", borderRadius: "6px" }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <label htmlFor="file-upload" className="media-button" title="Прикрепить файл">
          📎
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ display: "none" }}
        />
        <textarea
          placeholder="Введите сообщение"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
        />
        {file && (
          <div className="file-preview">
            📎 {file.name} {uploading && <span className="uploading"> — Загрузка...</span>}
          </div>
        )}
        <button className="send-button" onClick={sendMessage} disabled={uploading}>
          Отправить
        </button>
      </div>
    </div>
  );
}

export default Chat;
