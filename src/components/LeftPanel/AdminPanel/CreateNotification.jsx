import React, { useState } from "react";
import "./CreateNotification.css";
import { useNotifications } from "./NotificationContext";

const iconOptions = [
  {
    label: "Пара",
    value: "https://cdn-icons-png.flaticon.com/512/3588/3588294.png",
  },
  {
    label: "Сообщение",
    value: "https://cdn-icons-png.flaticon.com/512/2950/2950661.png",
  },
  {
    label: "Обновление",
    value: "https://cdn-icons-png.flaticon.com/512/1827/1827371.png",
  },
];

function CreateNotification({ onBack }) {
  const { addNotification } = useNotifications();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    addNotification({
      title,
      message,
      image,
    });

    alert("Уведомление отправлено");
    onBack();
  };

  return (
    <div className="create-notification-container">
      <div className="close-button" onClick={onBack}>
        ×
      </div>

      <h2>Создать уведомление</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Текст уведомления"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <select value={image} onChange={(e) => setImage(e.target.value)} required>
          <option value="">Выбери иконку</option>
          {iconOptions.map((icon) => (
            <option key={icon.value} value={icon.value}>
              {icon.label}
            </option>
          ))}
        </select>

        {image && (
          <div className="icon-preview">
            <img src={image} alt="preview" />
            <p>Превью иконки</p>
          </div>
        )}

        <div className="button-container">
          <button type="submit" className="submit-button">
            Отправить
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateNotification;
