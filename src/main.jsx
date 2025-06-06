import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { NotificationProvider } from "./components/LeftPanel/AdminPanel/NotificationContext";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <NotificationProvider>
    <BrowserRouter>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </BrowserRouter>
  </NotificationProvider>
);
