import React, { useState, useEffect } from "react";
import "./UserInfo.css";
import Notifications from "./Notifications";

const UserInfo = () => {
  const [isTooltipVisible, setTooltipVisible] = useState(false);
  const [user, setUser] = useState(null);

  // Чтение данных из localStorage один раз при монтировании
  useEffect(() => {
    const storedUser = {
      name: localStorage.getItem("name"),
      role: localStorage.getItem("role"),
      student_number: localStorage.getItem("student_number"),
      group: localStorage.getItem("group"),
    };

    if (storedUser.name && storedUser.role) {
      setUser(storedUser);
    }
  }, []);

  const handleMouseEnter = () => setTooltipVisible(true);
  const handleMouseLeave = () => setTooltipVisible(false);

  if (!user) return <div>Загрузка...</div>;

  const nameParts = user.name.split(" ");
  const lastName = nameParts[0];
  const initials = nameParts.slice(1).map(name => name[0]).join(".") + ".";

  return (
    <div className="user-info">
      <div className="user-avatar">{lastName[0]}</div>
      <div
        className="user-details"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="user-name">{lastName} {initials}</div>

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
      <Notifications />
    </div>
  );
};

export default UserInfo;
