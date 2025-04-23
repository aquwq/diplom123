import React, { useState, useEffect } from "react";
import "./UserInfo.css";
import Notifications from "./Notifications"; // 👈 подключаем

const UserInfo = () => {
  const [isTooltipVisible, setTooltipVisible] = useState(false);
  const [user, setUser] = useState(null);  // Состояние для данных пользователя

  // Пример функции для получения данных о пользователе с бэкенда
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('access'); // Извлекаем токен с ключом "access"
        console.log('Токен:', token); // Выводим токен в консоль для проверки

        const response = await fetch("http://localhost:8000/accounts/api/user/", {
          headers: {
            "Authorization": `Bearer ${token}`,  // Добавляем токен
          },
        });

        console.log('Ответ от сервера:', response); // Логируем сам ответ от сервера

        if (!response.ok) {
          throw new Error("Ошибка при получении данных");
        }

        const data = await response.json();
        console.log('Данные пользователя:', data); // Логируем полученные данные
        setUser(data);

        if (data?.role) {
          localStorage.setItem("role", data.role);
        }

      } catch (error) {
        console.error("Ошибка:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleMouseEnter = () => {
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  if (!user) {
    return <div>Загрузка...</div>;  // Пока данные не загружены, отображаем индикатор загрузки
  }

  // Разделяем имя и инициалы
  const nameParts = user.name.split(" ");
  const lastName = nameParts[0];
  const initials = nameParts.slice(1).map(name => name[0]).join(".") + "."; // Инициалки

  const userInfo = (
    <div className="user-info">
      <div className="user-avatar">{lastName[0]}</div> {/* Инициал пользователя */}
      <div
        className="user-details"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="user-name">{lastName} {initials}</div> {/* Фамилия И.О. */}

        {isTooltipVisible && (
  <div className="user-tooltip">
    <div className="user-tooltip-text">
      <p><strong>ФИО:</strong> {user.name}</p>

      {user.role === "студент" && (
        <>
          <p><strong>Номер зачётной книжки:</strong> {user.student_number || "Не указано"}</p>
          <p><strong>Группа:</strong> {user.group || "Не указана"}</p>
        </>
      )}

      <p><strong>Роль:</strong> {user.role}</p>
    </div>
  </div>
)}
      </div>
      <Notifications /> {/* 👈 вставляем колокольчик */}
    </div>
  );

  return userInfo;
};

export default UserInfo;
