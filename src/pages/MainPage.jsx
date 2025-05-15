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
  const [panelVisible, setPanelVisible] = useState(true);
  const togglePanelVisibility = () => setPanelVisible(v => !v);
  const [rightPanelWidth, setRightPanelWidth] = useState(300);

  return (
    <div className={`app-container ${isAppMenuOpen ? "blurred" : ""}`}>
      <LeftPanel
        onChannelClick={onChannelClick}
        panelVisible={panelVisible}
        togglePanelVisibility={togglePanelVisibility}
      />

      <div className="content-wrapper">
        <CenterContent
          isTranslating={isTranslating}
          onCloseTranslating={onCloseTranslating}
          currentChannel={currentChannel}
          panelVisible={panelVisible}
          rightPanelWidth={rightPanelWidth}
        />
        <RightPanel
          currentChannel={currentChannel}
          isTranslating={isTranslating}
          width={rightPanelWidth}
          onResize={setRightPanelWidth}
        />
      </div>
    </div>
  );
}

export default MainPage;
