import React, { useState } from "react";
import "./appmenu.css";
import Calculator from "./apps/Calculator";
import Note from "./apps/Note";
import ZGU from "./apps/ZGU";

function AppMenu({ onClose }) {
  const [activeApp, setActiveApp] = useState(null);

  const apps = [
    { name: "Калькулятор", icon: "📱" },
    { name: "Заметки", icon: "📝" },
    { name: "ЗГУ", icon: "📚" },
  ];

  return (
    <div className="overlay">
      <div className="app-menu">
        <button className="close-button" onClick={onClose}>
          ✖
        </button>
        <h2>Приложения</h2>
        <div className="app-list-container">
          {activeApp === null ? (
            <div className="app-list">
              {apps.map((app, index) => (
                <div
                  key={index}
                  className="app-card"
                  onClick={() => setActiveApp(app.name)}
                >
                  <div className="app-icon">{app.icon}</div>
                  <div className="app-title">{app.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="app-content">
              <h3>{activeApp}</h3>
              <div className="content-display">
                {activeApp === "Калькулятор" && <Calculator />}
                {activeApp === "Заметки" && <Note />}
                {activeApp === "ЗГУ" && <ZGU />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppMenu;
