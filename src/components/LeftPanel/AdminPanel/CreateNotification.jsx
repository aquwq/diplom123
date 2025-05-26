import React, { useState, useEffect } from "react";
import "./CreateNotification.css";
import { useNotifications } from "./NotificationContext";

function CreateNotification({ onBack }) {
  const { addNotification } = useNotifications();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groups, setGroups] = useState([]);
  const [iconOptions, setIconOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access");
      try {
        const groupRes = await fetch("http://localhost:8000/api/groups/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (groupRes.ok) {
          const groupData = await groupRes.json();
          setGroups(groupData);
        }

        const iconRes = await fetch("http://localhost:8000/communication/gicons/");
        if (iconRes.ok) {
          const iconData = await iconRes.json();
          const formattedIcons = iconData.map((url) => {
            const decodedUrl = decodeURIComponent(url);
            const parts = decodedUrl.split("/");
            const name = parts[parts.length - 1].split(".")[0];
            return { label: name, value: decodedUrl };
          });
          setIconOptions(formattedIcons);
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access");

    const res = await fetch("http://localhost:8000/communication/create/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        message,
        image,
        group: groupId || null,
      }),
    });

    if (res.ok) {
      alert("Уведомление отправлено");
      onBack();
    } else {
      const error = await res.json();
      alert("Ошибка: " + JSON.stringify(error));
    }
  };

  return (
    <div className="create-notification-container">
      <div className="close-button" onClick={onBack}>×</div>
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
          <div className="icon-preview-image">
            <img src={image} alt="preview" />
            <p>Превью иконки</p>
          </div>
        )}

        <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          <option value="">Все студенты</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name} ({group.student_count})
            </option>
          ))}
        </select>

        <div className="button-container">
          <button type="submit" className="submit-button">Отправить</button>
        </div>
      </form>
    </div>
  );
}

export default CreateNotification;
