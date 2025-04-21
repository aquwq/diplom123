import React from "react";
import "./RightPanel.css";
import ParticipantsList from "./ParticipantsList";
import Chat from "./Chat";

function RightPanel({ currentChannel }) {
  const participants = [
    "Пользователь 1",
    "Пользователь 2",
    "Пользователь 3",
    "Пользователь 4",
    "Пользователь 5",
    "Пользователь 6",
    "Пользователь 7",
    "Пользователь 8",
    "Пользователь 9",
    "Пользователь 10",
  ];

  const messages = [
    { user: "Пользователь 1", text: "Привет!" },
    { user: "Пользователь 2", text: "Здравствуйте!" },
    { user: "Пользователь 3", text: "Как дела?" },
  ];

  return (
    <div className={`right-panel ${currentChannel ? "active" : ""}`}>
      {currentChannel ? (
        <>
          <div className="content-container">
            <div className="participants-section">
              <h2 className="section-title">
                Пользователи канала "{currentChannel}"
              </h2>
              <ParticipantsList participants={participants} />
            </div>

            <div className="divider" />

            <div className="chat-section">
              <h2 className="section-title">Чат канала "{currentChannel}"</h2>
              <Chat messages={messages} />
            </div>
          </div>
        </>
      ) : (
        <p className="no-channel-message">
          Выберите канал, чтобы начать общение
        </p>
      )}
    </div>
  );
}

export default RightPanel;
