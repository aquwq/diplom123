import React, { useEffect, useState } from "react";
import "./RightPanel.css";
import ParticipantsList from "./ParticipantsList";
import Chat from "./Chat";

function RightPanel({ currentChannel }) {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const fetchParticipants = async () => {
      const token = localStorage.getItem("access");
      if (!currentChannel) return;

      try {
        const res = await fetch(`http://localhost:8000/communication/channels/${currentChannel}/participants/`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setParticipants(data);
      } catch (err) {
        console.error("Ошибка загрузки участников:", err);
      }
    };

    fetchParticipants();
  }, [currentChannel]);

  const messages = [
    { user: "Пользователь 1", text: "Привет!" },
    { user: "Пользователь 2", text: "Здравствуйте!" },
    { user: "Пользователь 3", text: "Как дела?" },
  ];

  return (
    <div className={`right-panel ${currentChannel ? "active" : ""}`}>
      {currentChannel ? (
        <div className="content-container">
          <div className="participants-section">
            <h2 className="section-title">
              Пользователи канала: "{currentChannel}"
            </h2>
            <ParticipantsList participants={participants.map(p => p.name)} />
          </div>
          <div className="divider" />
          <div className="chat-section">
            <h2 className="section-title">Чат канала</h2>
            <Chat messages={messages} />
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
