import React, { useState } from "react";
import LeftPanel from "../components/LeftPanel/LeftPanel";
import CenterContent from "../components/CenterContent/CenterContent";
import RightPanel from "../components/RightPanel/RightPanel";

function MainPage({
  onChannelClick,
  currentChannel,
  isTranslating,
  onCloseTranslating,
  isAppMenuOpen
}) {
  // --- Новый стейт для боковой панели ---
  const [panelVisible, setPanelVisible] = useState(true);
  const togglePanelVisibility = () => setPanelVisible(v => !v);

  return (
    <div className={`app-container ${isAppMenuOpen ? "blurred" : ""}`}>
      {/* Передаём флаг и функцию-валидатор в LeftPanel */}
      <LeftPanel
        onChannelClick={onChannelClick}
        panelVisible={panelVisible}
        togglePanelVisibility={togglePanelVisibility}
      />

      {/* Класс для центрального блока в зависимости от panelVisible */}
      <div className={`center-content ${
          panelVisible ? "center-collapsed" : "center-expanded"
        }`}>
        <CenterContent
          isTranslating={isTranslating}
          onCloseTranslating={onCloseTranslating}
          currentChannel={currentChannel}
        />
      </div>

      <RightPanel
        currentChannel={currentChannel}
        isTranslating={isTranslating}
      />
    </div>
  );
}

export default MainPage;
