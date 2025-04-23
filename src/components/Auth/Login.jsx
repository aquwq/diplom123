import React, { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const response = await fetch("http://localhost:8000/accounts/api/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });
  
    const data = await response.json();
  
    if (response.ok) {
      // Сохраняем access + refresh токены в localStorage потом надо поменять на куки
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      onLogin(); // вызываем функцию логина
    } else {
      alert("Неверный логин или пароль"); // я бы заменил  alert на что-то другое, но не знаю на что и как
    }
  };
  

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>NorVoice</h2>
        <input
          type="text"
          placeholder="Номер зачётки"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}

export default Login;
