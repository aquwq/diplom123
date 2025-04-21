import React from "react";
import "./ChannelItem.css";

function ChannelItem({ name, onClick }) {
  return (
    <div className="channel-item" onClick={onClick}>
      {name}
    </div>
  );
}

export default ChannelItem;
