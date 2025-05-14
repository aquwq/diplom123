import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";

function Chat({ messages, setMessages, currentChannel }) {
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null); // Состояние для выбранного файла
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null);

  // Функция для получения имени пользователя и его ID
  const fetchUserName = async () => {
    const token = localStorage.getItem("access");
    if (token) {
      try {
        const response = await fetch("http://localhost:8000/accounts/api/user/", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUserName(data.name); // Присваиваем имя пользователя из API
          setUserId(data.id); // Присваиваем ID пользователя из API
        } else {
          console.error("Ошибка получения имени пользователя");
        }
      } catch (error) {
        console.error("Ошибка при запросе имени пользователя", error);
      }
    }
  };

  // Функция для форматирования имени (Фамилия И.О.)
  const formatUserName = (fullName) => {
    const nameParts = fullName.split(" ");
    if (nameParts.length >= 2) {
      // Формат: Фамилия И.О.
      return `${nameParts[0]} ${nameParts[1].charAt(0)}.${nameParts[2] ? nameParts[2].charAt(0) : ""}`;
    }
    return fullName; // Если имя не в ожидаемом формате, просто возвращаем его как есть
  };

  // Функция для отправки сообщения
  const sendMessage = async () => {
      if (!input.trim() && !file) return;

      let uploadedPath = null;
      let uploadedName = null;

      if (file) {
        const uploaded = await uploadFile(file);
        if (!uploaded) {
          console.error("Файл не загружен");
          return;
        }
        uploadedPath = uploaded.path;
        uploadedName = uploaded.file_name;
      }

      const messageData = {
        message: input,
        sender: userName,
        file_path: uploadedPath, // путь к файлу (если есть)
        file_name: uploadedName  // имя файла (если есть)
      };

      ws.current.send(JSON.stringify(messageData));
      setInput("");
      setFile(null);
    };

      

  // Функция для отправки файла на сервер
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("access");

    try {
      const response = await fetch("http://localhost:8000/communication/upload/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          path: data.path,
          file_name: file.name, // Либо data.file_name, если сервер отдаёт это
        };
      } else {
        console.error("Ошибка загрузки файла");
        return null;
      }
    } catch (error) {
      console.error("Ошибка при загрузке файла:", error);
      return null;
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
    fetchUserName(); // Получаем имя пользователя при монтировании компонента

    if (!currentChannel) return;

    const token = localStorage.getItem("access");
    const socket = new WebSocket(
      `ws://localhost:8000/ws/communication/channels/${currentChannel}/?token=${token}`
    );
    ws.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Получено сообщение:", data);

      if (data.type === "chat_message") {
        const msg = data.message;

        // Сравниваем ID отправителя с текущим пользователем
        const formattedSender = msg.sender.id === userId
          ? "Вы" // Для текущего пользователя выводим "Вы"
          : formatUserName(msg.sender.name); // Для других выводим Фамилия И.О.

        // Обновляем состояние сообщений
        setMessages((prevMessages) => {
          const isDuplicate = prevMessages.some(
            (m) => m.timestamp === msg.timestamp && m.sender === msg.sender
          );

          if (!isDuplicate) {
            return [
              ...prevMessages,
              { 
                ...msg,
                senderDisplayName: formattedSender // Сохраняем отформатированное имя
              }
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

  // Обработка выбора файла
  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Сохраняем выбранный файл в стейт
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.senderDisplayName === "Вы" ? "message-self" : "message-other"}`}
          >
            {/* Сначала отображаем текст сообщения */}
            <div className="message-content">
              <strong>{message.senderDisplayName}:</strong>
              <p>{message.content}</p>
            </div>

            {/* Внизу — временная метка */}
            <div className="message-meta">
              <small>{new Date(message.timestamp).toLocaleString()}</small>
            </div>

            {message.uploaded_file && (
              <div className="attached-file">
                📎{" "}
                <a
                  href={`http://localhost:9000/${message.uploaded_file.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {message.uploaded_file.file_name}
                </a>
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
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
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
