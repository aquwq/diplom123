// RightPanel.jsx
import React, { useEffect, useState } from "react";
import "./RightPanel.css";
import Chat from "./Chat";
import { FiMessageCircle } from "react-icons/fi";

function RightPanel({ currentChannel, width }) {
  const [participants, setParticipants] = useState([]);
  const [channelName, setChannelName] = useState("");
  const [messages, setMessages] = useState([]);
const [messagesByChannel, setMessagesByChannel] = useState({});

const updateChannelMessages = (channelId, messages) => {
  setMessagesByChannel((prev) => ({
    ...prev,
    [channelId]: messages,
  }));
};

  useEffect(() => {
    if (!currentChannel) return;

    const token = localStorage.getItem("access");

    // Загружаем имя канала
    const fetchChannelName = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/communication/channels/${currentChannel}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setChannelName(data.name);
      } catch (err) {
        console.error("Ошибка загрузки названия канала:", err);
      }
    };
    fetchChannelName();

    // Подключаемся к WebSocket для списка участников
    const socket = new WebSocket(
      `ws://localhost:8000/ws/communication/channels/${currentChannel}/?token=${token}`
    );
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "participants_update") {
        setParticipants(data.participants);
      }
    };
    socket.onerror = (e) => console.error("Ошибка WebSocket:", e);

    return () => socket.close();
  }, [currentChannel]);

  return (
    <div className="right-panel" style={{ width: `${width}px` }}>
      {currentChannel ? (
        <div className="content-container">
          <div className="divider" />
          <div className="chat-section">
            <h2 className="section-title">Чат канала "{currentChannel}"</h2>
            <Chat
              messages={messages}
              setMessages={setMessages}
              currentChannel={currentChannel}
            />
          </div>
        </div>
      ) : (
        <div className="no-channel-container">
          <div className="no-channel-block">
            <FiMessageCircle className="no-channel-icon" size={48} />
            <h2 className="no-channel-title">Нет активного канала</h2>
            <p className="no-channel-subtitle">
              Выберите канал слева, чтобы начать живое общение и обмен сообщениями.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default RightPanel;
