import React, { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (newNotification) => {
    setNotifications((prev) => {
      const exists = prev.some((n) => n.id === newNotification.id);
      if (exists) return prev;
      return [{ ...newNotification, isNew: true }, ...prev];
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isNew: false } : n))
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        clearNotifications,
        markAsRead,
        setNotifications, // 👈 добавляем setNotifications в контекст
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
