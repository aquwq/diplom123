import React from "react";
import "./ChannelItem.css";

function ChannelItem({ name, onClick, isActive, isConnected, onConnect }) {
  return (
    <div className={`channel-item ${isActive ? "active" : ""}`} onClick={onClick}>
      <span>{name}</span>
      {isActive && (
        <button
          className={isConnected ? "disconnect-button" : "connect-button"}
          onClick={(e) => {
            e.stopPropagation();
            onConnect();
          }}
        >
          {isConnected ? "Отключиться" : "Подключиться"}
        </button>
      )}
    </div>
  );
}

export default ChannelItem;
