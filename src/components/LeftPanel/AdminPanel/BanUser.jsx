import React, { useState } from "react";
import "./BanUser.css";

function BanUser({ onBack }) {
  const [formData, setFormData] = useState({
    recordBook: "",
    group: "",
    fullName: "",
    password: "",
    isTeacher: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBan = (e) => {
    e.preventDefault();
    const confirmed = window.confirm(
      `Вы уверены, что хотите забанить:\nФИО: ${formData.fullName}\nЗачётка: ${formData.recordBook}?`
    );
    if (confirmed) {
      alert("Пользователь забанен");
      onBack();
    }
  };

  return (
    <div className="ban-user-container">
      <h2>Заблокировать пользователя</h2>
      <form onSubmit={handleBan}>
        <input
          type="text"
          name="recordBook"
          placeholder="Введите номер зачётки"
          value={formData.recordBook}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="group"
          placeholder="Введите группу"
          value={formData.group}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="fullName"
          placeholder="Введите ФИО"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="password"
          placeholder="Введите пароль"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="isTeacher"
            checked={formData.isTeacher}
            onChange={handleChange}
          />
          Преподаватель
        </label>

        <button type="submit" className="ban-button">
          Забанить
        </button>
      </form>
      <button onClick={onBack}>Назад</button>
    </div>
  );
}

export default BanUser;
