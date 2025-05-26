import React, { useState, useEffect } from "react";
import "./UserInfo.css";
import Notifications from "./Notifications";

const UserInfo = ({ onClick }) => {
  const [isTooltipVisible, setTooltipVisible] = useState(false);
  const [user, setUser] = useState(null);

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
        onClick={onClick} // 🔴 КЛИК для открытия модального окна
      >
        <div className="user-name">{lastName} {initials}</div>

        {isTooltipVisible && (
          <div className="user-tooltip user-hover-hint">
            Нажмите
          </div>
        )}
      </div>
      <Notifications />
    </div>
  );
};

export default UserInfo;
