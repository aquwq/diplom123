import React, { useState } from "react";
import "./AdminPanel.css";
import AddUser from "./AddUser";
import BanUser from "./BanUser";
import CreateNotification from "./CreateNotification";

function AdminPanel({ onClose }) {
  const [action, setAction] = useState(null);

  const renderForm = () => {
    switch (action) {
      case "add":
        return <AddUser onBack={() => setAction(null)} />;
      case "ban":
        return <BanUser onBack={() => setAction(null)} />;
      case "notify":
        return <CreateNotification onBack={() => setAction(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-panel">
      {!action ? (
        <>
          <h2>Панель администратора</h2>
          <button onClick={() => setAction("add")}>Добавить пользователя</button>
          <button onClick={() => setAction("ban")}>Забанить пользователя</button>
          <button onClick={() => setAction("notify")}>Создать уведомление</button>
          <button onClick={onClose}>Закрыть</button>
        </>
      ) : (
        renderForm()
      )}
    </div>
  );
}

export default AdminPanel;
