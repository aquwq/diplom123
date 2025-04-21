import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import { NotificationProvider } from "./components/LeftPanel/AdminPanel/NotificationContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <NotificationProvider>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </NotificationProvider>
);
