import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./styles/global.css";

import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import Loader from "./components/Loader/Loader";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleLoad = () => {
      const token = localStorage.getItem("access");
      if (token) {
        setIsLoggedIn(true);
        navigate("/app");
      } else {
        navigate("/login");
      }
      setIsLoading(false);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate("/app");
  };

  const handleChannelClick = (channelName) => {
    setCurrentChannel(channelName);
    setIsTranslating(true);
  };

  const handleCloseTranslating = () => {
    setIsTranslating(false);
    setCurrentChannel(null);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route
        path="/app"
        element={
          <MainPage
            onChannelClick={handleChannelClick}
            currentChannel={currentChannel}
            isTranslating={isTranslating}
            onCloseTranslating={handleCloseTranslating}
            isAppMenuOpen={isAppMenuOpen}
          />
        }
      />
    </Routes>
  );
}

export default App;
