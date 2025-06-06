// MainPage.jsx
import React, { useState } from "react";
import LeftPanel from "../components/LeftPanel/LeftPanel";
import CenterContent from "../components/CenterContent/CenterContent";
import RightPanel from "../components/RightPanel/RightPanel";
import "../styles/global.css";

function MainPage({
  onChannelClick,
  currentChannel,
  isTranslating,
  onCloseTranslating,
}) {
  const [leftVisible, setLeftVisible] = useState(true);
  const [rightWidth, setRightWidth] = useState(300);

  const toggleLeft = () => setLeftVisible((v) => !v);

  // теперь сетку будем переключать через CSS-классы, а не inline style
  const containerClass = leftVisible
    ? "app-container left-visible"
    : "app-container left-hidden";

  return (
    <div className={containerClass}>
      <LeftPanel
        onChannelClick={onChannelClick}
        panelVisible={leftVisible}
        togglePanelVisibility={toggleLeft}
      />

      <CenterContent
        isTranslating={isTranslating}
        onCloseTranslating={onCloseTranslating}
        currentChannel={currentChannel}
        leftVisible={leftVisible}
        rightWidth={rightWidth}
      />

      {/* Обязательно прокидываем className="right-panel" */}
      <RightPanel
        className="right-panel"
        currentChannel={currentChannel}
        panelVisible={true}
        isTranslating={isTranslating}
        width={rightWidth}
        onResize={setRightWidth}
      />
    </div>
  );
}

export default MainPage;
