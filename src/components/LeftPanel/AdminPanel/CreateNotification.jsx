import React from "react";
import "./CreateNotification.css";

function CreateNotification({ onBack }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    // логика отправки уведомления
    alert("Уведомление создано");
    onBack();
  };

  return (
    <div className="create-notification-container">
      <h2>Создать уведомление</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Текст уведомления" required />
        <button type="submit">Отправить</button>
      </form>
      <button onClick={onBack}>Назад</button>
    </div>
  );
}

export default CreateNotification;
