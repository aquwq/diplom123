import React, { useState, useEffect } from "react";
import "./LeftPanel.css";
import ChannelList from "./ChannelList";
import AppMenu from "./AppMenu";
import AdminPanel from "./AdminPanel/AdminPanel";
import UserInfo from "./UserInfo";

function LeftPanel({ onChannelClick, onAdminPanelClick }) {
  const [showAppMenu, setShowAppMenu] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [channelsVisible, setChannelsVisible] = useState(true);

  const [role, setRole] = useState(localStorage.getItem("role") || ""); // Считываем роль из localStorage с дефолтным значением ""

  // Обновляем роль при изменении в localStorage
  useEffect(() => {
    const roleFromStorage = localStorage.getItem("role");
    if (roleFromStorage) {
      setRole(roleFromStorage);
    }
  }, []);

  const toggleAppMenu = () => {
    setShowAppMenu(!showAppMenu);
  };

  const toggleAdminPanel = () => {
    setShowAdminPanel(!showAdminPanel);
  };

  const handleAdminClick = () => {
    toggleAdminPanel();
  };

  const toggleChannelsVisibility = () => {
    setChannelsVisible(!channelsVisible);
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    window.location.reload(); // Перезагрузка страницы после выхода
  };

  return (
    <>
      <div className={`left-panel ${showAppMenu || showAdminPanel ? "blurred" : ""}`}>
        <UserInfo onTooltipToggle={(state) => {}} />

        <div className="channels-header" onClick={toggleChannelsVisibility}>
          Каналы {channelsVisible ? "▲" : "▼"}
        </div>

        <div className={`channels-container ${channelsVisible ? "expanded" : "collapsed"}`}>
          <ChannelList onChannelClick={onChannelClick} />
          <div className="scroll-indicator"></div>
        </div>

        <div className="button-group">
          <button className="app-button" onClick={toggleAppMenu} style={{ width: role !== "студент" ? "48%" : "100%" }}>
            Приложения
          </button>

          {/* Кнопка "Панель администратора" видна всем, кроме студентов */}
          {role && role !== "студент" && (
            <button className="admin-button" onClick={handleAdminClick}>
              Панель администратора
            </button>
          )}
        </div>

        <div className="logout-section">
          <button className="logout-button" onClick={handleLogout}>
            Выйти из аккаунта
          </button>
        </div>
      </div>

      {showAppMenu && <AppMenu onClose={toggleAppMenu} />}
      {showAdminPanel && <AdminPanel onClose={toggleAdminPanel} />}
    </>
  );
}

export default LeftPanel;
