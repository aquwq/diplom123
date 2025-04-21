import React, { useState } from "react";
import "./UserInfo.css";
import Notifications from "./Notifications"; // 👈 подключаем

const UserInfo = () => {
  const [isTooltipVisible, setTooltipVisible] = useState(false);

  const user = {
    fullName: "Березовский Константин Вячеславович",
    id: "1488228",
    group: "ИС-101",
    role: "Студент",
  };

  const handleMouseEnter = () => {
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  return (
    <div className="user-info">
      <div className="user-avatar">КВ</div>
      <div
        className="user-details"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="user-name">Березовский К.В.</div>
        {isTooltipVisible && (
          <div className="user-tooltip">
            <div className="user-tooltip-text">
              <p><strong>ФИО:</strong> {user.fullName}</p>
              <p><strong>Номер зачётной книжки:</strong> {user.id}</p>
              <p><strong>Группа:</strong> {user.group}</p>
              <p><strong>Роль:</strong> {user.role}</p>
            </div>
          </div>
        )}
      </div>
      <Notifications /> {/* 👈 вставляем колокольчик */}
    </div>
  );
};

export default UserInfo;
