import React, { useEffect, useState } from "react";
import "./Notifications.css";
import NotificationItem from "./NotificationItem";
import { useNotifications } from "./AdminPanel/NotificationContext";

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const {
    notifications,
    setNotifications,
    clearNotifications,
    markAsRead,
    addNotification,
  } = useNotifications();
  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8000/accounts/api/user/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUserId(data.id);
        } else {
          console.error("Не удалось получить пользователя:", await res.text());
        }
      } catch (error) {
        console.error("Ошибка при получении пользователя:", error);
      }
    };

    fetchUser();
  }, [token]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;

      try {
        const res = await fetch("http://localhost:8000/communication/list/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          let data = await res.json();

          // Декодируем ссылки на изображения, если они есть
          data = data.map((notif) => ({
            ...notif,
            image: notif.image ? decodeURIComponent(notif.image) : null,
          }));

          setNotifications(data); // заменяем весь список
        } else {
          console.error("Ошибка при загрузке уведомлений:", await res.text());
        }
      } catch (error) {
        console.error("Ошибка при загрузке уведомлений:", error);
      }
    };

    fetchNotifications();
  }, [setNotifications, token]);

  useEffect(() => {
    if (!userId || !token) return;

    const socket = new WebSocket(`ws://localhost:8000/ws/notifications/${userId}/?token=${token}`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Аналогично — декодируем image если есть
      if (data.image) {
        data.image = decodeURIComponent(data.image);
      }

      addNotification(data);
    };

    socket.onerror = (err) => {
      console.error("Ошибка WebSocket:", err);
    };

    socket.onclose = () => {
      console.warn("WebSocket закрыт");
    };

    return () => socket.close();
  }, [userId, token, addNotification]);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const handleNotificationClick = (id) => markAsRead(id);

  return (
    <div className="notifications-wrapper">
      <button className="bell-button" onClick={toggleDropdown}>
        🔔
      </button>
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
