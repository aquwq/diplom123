// src/components/UserProfileModal.jsx
import React, { useState, useEffect } from "react";
import "./UserProfileModal.css";

function UserProfileModal({ onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access");

        const response = await fetch("http://localhost:8000/accounts/api/user/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Ошибка при получении данных");

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Ошибка при загрузке пользователя:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="profile-modal-overlay" onClick={onClose}>
        <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const nameInitial = user.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <div className="avatar-placeholder">
            <span>{nameInitial}</span>
          </div>
          <h2 className="profile-title">Личный кабинет</h2>
          <button className="custom-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <label>ФИО:</label>
            <span>{user.name || "Не указано"}</span>
          </div>

          <div className="info-item">
            <label>Роль:</label>
            <span>{user.role || "Не указано"}</span>
          </div>

          {user.role === "студент" && (
            <>
              <div className="info-item">
                <label>Номер зачётной книжки:</label>
                <span>{user.student_number || "Не указано"}</span>
              </div>
              <div className="info-item">
                <label>Группа:</label>
                <span>{user.group || "Не указана"}</span>
              </div>
            </>
          )}

          <div className="info-item">
            <label>Email:</label>
            <span>{user.email || "Не указан"}</span>
          </div>
        </div>
        <div className="help-support">
            <button className="help-button" onClick={() => setShowHelp(!showHelp)}>❓</button>
            {showHelp && (
            <div className="help-popup">
            <p><strong>Здравствуйте!</strong><br />Если у вас есть вопросы или неполадки,<br />напишите нам на почту:</p>
            <p><a href="mailto:testpochta@gmail.com">testpochta@gmail.com</a></p>
            <ul>
                <li>📌 Название темы</li>
                <li>👤 Ваше ФИО</li>
                <li>🎓 Номер группы</li>
                </ul>
        </div>
  )}
</div>
      </div>
    </div>
  );
}

export default UserProfileModal;
