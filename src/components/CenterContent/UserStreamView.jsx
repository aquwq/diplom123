import React, { useEffect, useRef } from "react";
import "./UserStreamView.css";

export default function UserStreamView({ user, screenStream, webcamStream, onClose }) {
  // Ссылки на видео элементы
  const screenVideoRef = useRef(null);
  const webcamVideoRef = useRef(null);

  // Устанавливаем потоки, когда они изменяются
  useEffect(() => {
    console.log("🖥️ Экранный поток в UserStreamView:", screenStream);
    console.log("📸 Веб-кам поток в UserStreamView:", webcamStream);

    if (screenStream instanceof MediaStream && screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStream;
    } else {
      console.warn("⚠️ Экранный поток не получен!");
    }

    if (webcamStream instanceof MediaStream && webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = webcamStream;
    } else {
      console.warn("⚠️ Веб-кам поток не получен!");
    }
  }, [screenStream, webcamStream]);

  // Проверяем, есть ли хотя бы один активный поток
  const hasActiveStreams = screenStream || webcamStream;

  return (
    <div className="user-stream-view">
      <div className="stream-header">
        <h2>Трансляция пользователя: {user}</h2>
        <button onClick={onClose} className="close-button">
          Вернуться назад
        </button>
      </div>

      <div className="streams-container">
        {hasActiveStreams ? (
          <>
            {screenStream && (
              <div className="stream-box">
                <video ref={screenVideoRef} autoPlay playsInline muted />
              </div>
            )}
            {webcamStream && (
              <div className="stream-box">
                <video ref={webcamVideoRef} autoPlay playsInline muted />
              </div>
            )}
          </>
        ) : (
          <p>Нет активных трансляций</p>
        )}
      </div>
    </div>
  );
}
