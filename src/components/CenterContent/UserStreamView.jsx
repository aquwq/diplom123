import React, { useEffect, useRef, useState } from "react";
import "./UserStreamView.css";

export default function UserStreamView({
  user,
  screenStream,
  webcamStream,
  onClose,
}) {
  const sRef = useRef();
  const wRef = useRef();
  const [showFsHint, setShowFsHint] = useState(false);
  const [volume, setVolume] = useState(1); // Ползунок громкости
  const [isMuted, setIsMuted] = useState(false); // Состояние "замутить"

  useEffect(() => {
    if (sRef.current) {
      sRef.current.srcObject = screenStream || null;
      sRef.current.volume = volume;
      sRef.current.muted = isMuted;
    }
    if (wRef.current) {
      wRef.current.srcObject = webcamStream || null;
      wRef.current.volume = volume;
      wRef.current.muted = isMuted;
    }
  }, [screenStream, webcamStream, volume, isMuted]);

  useEffect(() => {
    const onChange = () => setShowFsHint(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () =>
      document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toFullscreen = (ref) => {
    if (ref.current?.requestFullscreen) ref.current.requestFullscreen();
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <div className="user-stream-view">
      <button className="close-button" onClick={onClose}>
        Закрыть
      </button>
      <h3>Трансляция: {user}</h3>

      {screenStream ? (
        <div className="stream-box">
          <h4>Экран</h4>
          <video
            ref={sRef}
            autoPlay
            playsInline
            controls={false}
            onDoubleClick={() => toFullscreen(sRef)}
          />
        </div>
      ) : (
        <p>Экран не транслируется</p>
      )}

      {webcamStream ? (
        <div className="stream-box">
          <h4>Вебкамера</h4>
          <video
            ref={wRef}
            autoPlay
            playsInline
            muted
            onDoubleClick={() => toFullscreen(wRef)}
          />
        </div>
      ) : (
        <p>Вебкамера не включена</p>
      )}

      <div className="controls-wrapper">
        <label htmlFor="volume-slider">Громкость голоса:</label>
        <input
          id="volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
        />
        <button
          className={`mute-button ${isMuted ? "muted" : ""}`}
          onClick={toggleMute}
        >
          {isMuted ? "Размутить" : "Замутить"}
        </button>
      </div>

      {showFsHint && (
        <div className="fs-hint">
          Чтобы выйти из полноэкранного режима, нажмите Esc
        </div>
      )}
    </div>
  );
}
