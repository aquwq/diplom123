import React from "react";
import "./ChannelItem.css";

function ChannelItem({ name, onClick, isActive }) {
  return (
    <div className={`channel-item ${isActive ? "active" : ""}`} onClick={onClick}>
      <span>{name}</span>
    </div>
  );
}

export default ChannelItem;
