import React, { useEffect, useState } from "react";
import "./RightPanel.css";
import ParticipantsList from "./ParticipantsList";
import Chat from "./Chat";

function RightPanel({ currentChannel }) {
  const [participants, setParticipants] = useState([]);
  const [channelName, setChannelName] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!currentChannel) return;

    const token = localStorage.getItem("access");

    // Загружаем имя канала
    const fetchChannelName = async () => {
      try {
        const res = await fetch(`http://localhost:8000/communication/channels/${currentChannel}/`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });
        const data = await res.json();
        setChannelName(data.name);
      } catch (err) {
        console.error("Ошибка загрузки названия канала:", err);
      }
    };

    fetchChannelName();

    // Подключаемся к WebSocket
    const socket = new WebSocket(`ws://localhost:8000/ws/communication/channels/${currentChannel}/?token=${token}`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Обработка обновления списка участников
      if (data.type === "participants_update") {
        console.log("Participants update received:", data.participants);
        setParticipants(data.participants);
      }
    };

    socket.onerror = (e) => {
      console.error("Ошибка WebSocket:", e);
    };

    return () => {
      socket.close();
    };
  }, [currentChannel]);

  return (
    <div className={`right-panel ${currentChannel ? "active" : ""}`}>
      {currentChannel ? (
        <div className="content-container">
          <div className="participants-section">
            <h2 className="section-title">
              Пользователи канала: "{channelName}"
            </h2>
            <ParticipantsList participants={participants} />
          </div>
          <div className="divider" />
          <div className="chat-section">
            <h2 className="section-title">Чат канала "{channelName}"</h2>
            <Chat messages={messages} setMessages={setMessages} currentChannel={currentChannel} />
          </div>
        </div>
      ) : (
        <p className="no-channel-message">
          Выберите канал, чтобы начать общение
        </p>
      )}
    </div>
  );
}

export default RightPanel;