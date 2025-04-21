import React, { useState } from "react";
import "./AddUser.css";

function AddUser({ onBack }) {
  const [formData, setFormData] = useState({
    recordBook: "",
    fullName: "",
    isTeacher: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Пользователь добавлен:\nФИО: ${formData.fullName}\nЗачётка: ${formData.recordBook}\nПреподаватель: ${formData.isTeacher ? "Да" : "Нет"}`);
    onBack();
  };

  return (
    <div className="add-user-container">
      <h2>Добавить пользователя</h2>
      <form onSubmit={handleSubmit}>
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

        <button type="button" className="upload-button">
          Загрузить таблицу
        </button>
        <button type="submit">Добавить</button>
      </form>
      <button onClick={onBack}>Назад</button>
    </div>
  );
}

export default AddUser;
