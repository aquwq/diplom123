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
  const [panelsVisible, setPanelsVisible] = useState(true);
  const [rightPanelWidth, setRightPanelWidth] = useState(300);

  const togglePanelsVisibility = () => setPanelsVisible(v => !v);

  return (
    <div
      className={`app-container 
        ${isAppMenuOpen ? "blurred" : ""} 
        ${panelsVisible ? "sidebar-visible" : "sidebar-hidden"}
      `}
    >
      <LeftPanel
        onChannelClick={onChannelClick}
        panelVisible={panelsVisible}
        togglePanelVisibility={togglePanelsVisibility}
      />

      <div className="content-wrapper">
        <CenterContent
          isTranslating={isTranslating}
          onCloseTranslating={onCloseTranslating}
          currentChannel={currentChannel}
          panelVisible={panelsVisible}
          rightPanelWidth={rightPanelWidth}
        />
        <RightPanel
          currentChannel={currentChannel}
          panelVisible={panelsVisible}
          isTranslating={isTranslating}
          width={rightPanelWidth}
          onResize={setRightPanelWidth}
        />
      </div>
    </div>
  );
}

export default MainPage;
