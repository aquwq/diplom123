import React, { useState } from "react";
import "./Notifications.css";
import NotificationItem from "./NotificationItem";
import { useNotifications } from "./AdminPanel/NotificationContext";

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, clearNotifications, markAsRead } = useNotifications();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleNotificationClick = (id) => {
    markAsRead(id);
  };

  return (
    <div className="notifications-wrapper">
      <button className="bell-button" onClick={toggleDropdown}>🔔</button>
      {isOpen && (
        <div className="notifications-panel">
          {notifications.length > 0 ? (
            <>
              <div className="notifications-header">
                <button className="clear-btn" onClick={clearNotifications}>
                  Очистить все
                </button>
              </div>
              {notifications.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  title={notif.title}
                  message={notif.message}
                  image={notif.image}
                  isNew={notif.isNew}
                  onClick={() => handleNotificationClick(notif.id)}
                />
              ))}
            </>
          ) : (
            <div className="no-notifications">Нет новых уведомлений</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
