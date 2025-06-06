import React, { useState, useEffect } from "react";
import "./LeftPanel.css";
import ChannelList from "./ChannelList";

import AdminPanel from "./AdminPanel/AdminPanel";
import UserInfo from "./UserInfo";
import UserProfileModal from "./UserProfileModal"; // импорт
import { FiGrid, FiSettings, FiLogOut } from "react-icons/fi";

function LeftPanel({
  onChannelClick,
  panelVisible,             // из MainPage
  togglePanelVisibility     // из MainPage
}) {
  const [showAppMenu, setShowAppMenu] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [channelsVisible, setChannelsVisible] = useState(true);
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [showUserModal, setShowUserModal] = useState(false);
  const [userData, setUserData] = useState({
  name: localStorage.getItem("name") || "Неизвестно",
  role: localStorage.getItem("role") || "не указана",
  email: localStorage.getItem("email") || "нет почты"
});

  useEffect(() => {
    const r = localStorage.getItem("role");
    if (r) setRole(r);
  }, []);

  return (
    <>
      {/* Бургер всегда */}
      <button className="burger-button" onClick={togglePanelVisibility}>
        ☰
      </button>

      <aside
        className={`left-panel sidebar ${
          !panelVisible ? "hidden-panel" : ""
        } showAdminPanel ?`}
      >
        <div className="panel-header">
  <span className="logo">💬</span>
  <a href="https://polaruniversity.ru/" target="_blank" rel="noopener noreferrer">
    <h1 className="app-title">ISITvoice</h1>
  </a>
</div>

        <div className="channel-section">
          <div className="channels-header" onClick={() => setChannelsVisible(v => !v)}>
            Каналы {channelsVisible ? "▲" : "▼"}
          </div>
          <div className={`channels-container ${channelsVisible ? "expanded" : "collapsed"}`}>
            <ChannelList onChannelClick={onChannelClick} />
            <div className="scroll-indicator" />
          </div>
        </div>

        <div className="icon-buttons">
          
          {role && role !== "студент" && (
            <button className="icon-button admin-button" onClick={() => setShowAdminPanel(m => !m)} title="Админка">
              <FiSettings size={20} />
            </button>
          )}
        </div>

        <div className="bottom-section">
          
          <button className="icon-button logout-button" onClick={() => {
            localStorage.clear();
            window.location.reload();
          }} title="Выйти">
            <FiLogOut size={20} />
          </button>
        </div>

        <div className="userinfo-container">
          <UserInfo onClick={() => setShowUserModal(true)} />
        </div>
      </aside>

      
      {showAdminPanel && <AdminPanel onClose={() => setShowAdminPanel(false)} />}
        {showUserModal && (
  <UserProfileModal
    user={userData}
    onClose={() => setShowUserModal(false)}
  />
)}
    </>
  );
}

export default LeftPanel;
