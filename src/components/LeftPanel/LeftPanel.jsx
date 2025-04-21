import React, { useState } from "react";
import "./LeftPanel.css";
import ChannelList from "./ChannelList";
import AppMenu from "./AppMenu";
import AdminPanel from "./AdminPanel/AdminPanel";
import UserInfo from "./UserInfo";

function LeftPanel({ onChannelClick, onAdminPanelClick }) {
  const [showAppMenu, setShowAppMenu] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [channelsVisible, setChannelsVisible] = useState(true); // Новое состояние

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
          <button className="app-button" onClick={toggleAppMenu}>
            Приложения
          </button>
          <button className="admin-button" onClick={handleAdminClick}>
            Панель администратора
          </button>
        </div>
      </div>
      {showAppMenu && <AppMenu onClose={toggleAppMenu} />}
      {showAdminPanel && <AdminPanel onClose={toggleAdminPanel} />}
    </>
  );
}

export default LeftPanel;
