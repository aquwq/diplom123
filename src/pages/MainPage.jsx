import React from "react";
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
  return (
    <div className={`app-container ${isAppMenuOpen ? "blurred" : ""}`}>
      <LeftPanel onChannelClick={onChannelClick} />
      <div className="center-content">
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
