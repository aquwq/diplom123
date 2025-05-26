import React, { useEffect, useRef, useState } from "react";
import "./UserStreamView.css";

export default function UserStreamView({ user, screenStream, webcamStream, onClose }) {
  const screenVideoRef = useRef(null);
  const webcamVideoRef = useRef(null);

  const [showFsHint, setShowFsHint] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Установка потоков в видеотеги
  useEffect(() => {
    if (screenVideoRef.current) {
      if (screenStream instanceof MediaStream) {
        screenVideoRef.current.srcObject = screenStream;
      } else {
        screenVideoRef.current.srcObject = null;
      }
      screenVideoRef.current.volume = volume;
      screenVideoRef.current.muted = isMuted;
    }
  }, [screenStream, volume, isMuted]);

  useEffect(() => {
    if (webcamVideoRef.current) {
      if (webcamStream instanceof MediaStream) {
        webcamVideoRef.current.srcObject = webcamStream;
      } else {
        webcamVideoRef.current.srcObject = null;
      }
      webcamVideoRef.current.volume = volume;
      webcamVideoRef.current.muted = isMuted;
    }
  }, [webcamStream, volume, isMuted]);

  // Очистка srcObject при размонтировании или смене потока
  useEffect(() => {
    return () => {
      if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
      if (webcamVideoRef.current) webcamVideoRef.current.srcObject = null;
    };
  }, []);

  // Отслеживаем окончание треков в screenStream
  useEffect(() => {
    if (!screenStream) return;

    const handleEnded = () => onClose();
    screenStream.getTracks().forEach((track) => {
      track.addEventListener("ended", handleEnded);
    });

    return () => {
      screenStream.getTracks().forEach((track) => {
        track.removeEventListener("ended", handleEnded);
      });
    };
  }, [screenStream, onClose]);

  // Аналогично для webcamStream
  useEffect(() => {
    if (!webcamStream) return;

    const handleEnded = () => onClose();
    webcamStream.getTracks().forEach((track) => {
      track.addEventListener("ended", handleEnded);
    });

    return () => {
      webcamStream.getTracks().forEach((track) => {
        track.removeEventListener("ended", handleEnded);
      });
    };
  }, [webcamStream, onClose]);

  useEffect(() => {
    const onChange = () => setShowFsHint(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toFullscreen = (ref) => {
    if (ref.current?.requestFullscreen) ref.current.requestFullscreen();
  };

  const handleVolumeChange = (e) => setVolume(parseFloat(e.target.value));
  const toggleMute = () => setIsMuted((prev) => !prev);

  return (
    <div className="user-stream-view">
      <button className="close-button" onClick={onClose}>
        Закрыть
      </button>
      <h3>Трансляция: {user}</h3>

      <div className="streams-container" style={{ display: "flex", gap: "20px" }}>
        <div className="stream-container screen-stream" style={{ flex: 1 }}>
          <h4>Экран</h4>
          {screenStream ? (
            <video
              key={!!screenStream} // 👈 Перерисовывает <video> при сбросе потока
              ref={screenVideoRef}
              autoPlay
              playsInline
              controls={false}
              style={{ width: "100%", height: "auto", backgroundColor: "black" }}
              onDoubleClick={() => toFullscreen(screenVideoRef)}
            />
          ) : (
            <p>Экран не транслируется</p>
          )}
        </div>

        <div className="stream-container webcam-stream" style={{ flex: 1 }}>
          <h4>Вебкамера</h4>
          {webcamStream ? (
            <video
              key={!!webcamStream} // 👈 Перерисовывает <video> при сбросе потока
              ref={webcamVideoRef}
              autoPlay
              playsInline
              muted
              controls={false}
              style={{ width: "100%", height: "auto", backgroundColor: "black" }}
              onDoubleClick={() => toFullscreen(webcamVideoRef)}
            />
          ) : (
            <p>Вебкамера не включена</p>
          )}
        </div>
      </div>

      <div className="controls-wrapper" style={{ marginTop: "10px" }}>
        <label htmlFor="volume-slider">Громкость голоса:</label>
        <input
          id="volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          style={{ marginLeft: "10px", verticalAlign: "middle" }}
        />
        <button
          className={`mute-button ${isMuted ? "muted" : ""}`}
          onClick={toggleMute}
          style={{ marginLeft: "10px" }}
        >
          {isMuted ? "Размутить" : "Замутить"}
        </button>
      </div>

      {showFsHint && <div className="fs-hint">Чтобы выйти из полноэкранного режима, нажмите Esc</div>}
    </div>
  );
}
