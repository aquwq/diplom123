import React from "react";
import "./NotificationItem.css";

const NotificationItem = ({ title, message, image, isNew, onClick }) => {
  return (
    <div
      className={`notification-item ${isNew ? "highlight" : ""}`}
      onClick={onClick}
    >
      {image && <img src={image} alt="icon" className="notification-image" />}
      <div className="notification-text">
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default NotificationItem;
