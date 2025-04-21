import React, { useState, useEffect } from "react";
import "./styles/global.css";
import LeftPanel from "./components/LeftPanel/LeftPanel";
import CenterContent from "./components/CenterContent/CenterContent";
import RightPanel from "./components/RightPanel/RightPanel";
import Login from "./components/Auth/Login";
import Loader from "./components/Loader/Loader";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);

  // Прелоудер исчезнет только когда страница полностью загрузится
  useEffect(() => {
    const handleLoad = () => {
      setIsLoading(false);
    };

    // Если страница уже загружена
    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleChannelClick = (channelName) => {
    setCurrentChannel(channelName);
    setIsTranslating(true);
  };

  const handleCloseTranslating = () => {
    setIsTranslating(false);
    setCurrentChannel(null);
  };

  const toggleAppMenu = () => {
    setIsAppMenuOpen((prev) => !prev);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className={`app-container ${isAppMenuOpen ? "blurred" : ""}`}>
      <LeftPanel onChannelClick={handleChannelClick} />
      <div className="center-content">
        <CenterContent 
          isTranslating={isTranslating} 
          onCloseTranslating={handleCloseTranslating} 
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

export default App;
