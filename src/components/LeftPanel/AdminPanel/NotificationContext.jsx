import React, { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (newNotification) => {
    setNotifications((prev) => [
      { id: Date.now(), isNew: true, ...newNotification },
      ...prev,
    ]);
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
      value={{ notifications, addNotification, clearNotifications, markAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
