import React from "react";
import "./CenterContent.css";

function CenterContent({ isTranslating, onCloseTranslating, currentChannel }) {
  return (
    <div className="center-content">
      {isTranslating ? (
        <div className="conference-view">
          <h2 className="conference-title">Трансляция канала "{currentChannel}"</h2>
          <div className="conference-video">
            <div className="video-placeholder">Здесь будет видео</div>
          </div>
          <div className="conference-functions">
            <div className="function-buttons">
              <button className="mic-button">Включить/Выключить микрофон</button>
              <button className="screen-button">Показать свой экран</button>
            </div>
          </div>
          <button className="back-button" onClick={onCloseTranslating}>
            НА ГЛАВНУЮ
          </button>
        </div>
      ) : (
        <div>
          <h1>NorVoice</h1>
        </div>
      )}
    </div>
  );
}

export default CenterContent;
