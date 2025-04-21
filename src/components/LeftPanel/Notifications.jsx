import React, { useState, useRef, useEffect } from "react";
import "./Notifications.css";
import NotificationItem from "./NotificationItem";

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Новая пара",
      message: "Через 10 минут начнётся пара по математике.",
      image: "https://cdn-icons-png.flaticon.com/512/3588/3588294.png",
      isNew: true,
    },
    {
      id: 2,
      title: "Новое сообщение",
      message: "Преподаватель оставил комментарий к вашему заданию.",
      image: "https://cdn-icons-png.flaticon.com/512/2950/2950661.png",
      isNew: true,
    },
    {
      id: 3,
      title: "Обновление расписания",
      message: "Пара по информатике перенесена на пятницу.",
      isNew: true,
    },
    {
      id: 4,
      title: "Новое сообщение",
      message: "Преподаватель оставил комментарий к вашему заданию.",
      image: "https://cdn-icons-png.flaticon.com/512/2950/2950661.png",
      isNew: true,
    },
    {
      id: 5,
      title: "Обновление расписания",
      message: "Пара по информатике перенесена на пятницу.",
      isNew: true,
    },
    {
      id: 6,
      title: "Новое сообщение",
      message: "Преподаватель оставил комментарий к вашему заданию.",
      image: "https://cdn-icons-png.flaticon.com/512/2950/2950661.png",
      isNew: true,
    },
    {
      id: 7,
      title: "Обновление расписания",
      message: "Пара по информатике перенесена на пятницу.",
      isNew: true,
    },
  ]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === id ? { ...notif, isNew: false } : notif
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    // Можно добавить эффект при открытии панели уведомлений
  }, []);

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
