import React from "react";
import "./BanUser.css";

function BanUser({ onBack }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    // логика бана
    alert("Пользователь забанен");
    onBack();
  };

  return (
    <div className="ban-user-container">
      <h2>Забанить пользователя</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Имя пользователя" required />
        <button type="submit">Забанить</button>
      </form>
      <button onClick={onBack}>Назад</button>
    </div>
  );
}

export default BanUser;
