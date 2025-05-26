import React, { useState, useEffect } from "react";
import "./Login.css";
import "./RegisterTransition.css";

function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (isRegistering) {
      fetch("http://localhost:8000/adminpanel/api/groups/")
        .then((res) => res.json())
        .then((data) => setGroups(data))
        .catch((err) => console.error("Ошибка при загрузке групп:", err));
    }
  }, [isRegistering]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/accounts/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        // Получаем данные пользователя после получения токена
        const userResponse = await fetch("http://localhost:8000/accounts/api/user/", {
          headers: {
            Authorization: `Bearer ${data.access}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error("Не удалось получить данные пользователя");
        }

        const userData = await userResponse.json();
        console.log("Данные пользователя:", userData);

        if (userData?.role) {
          localStorage.setItem("role", userData.role);
          localStorage.setItem("name", userData.name);
          localStorage.setItem("student_number", userData.student_number || "");
          localStorage.setItem("group", userData.group || "");

        }

        onLogin(); // Только теперь переходим дальше

      } else {
        alert("Неверный логин или пароль");
      }
    } catch (error) {
      console.error("Ошибка при входе:", error);
      alert("Ошибка сервера. Попробуйте позже.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Пароли не совпадают");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/accounts/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          name: fullName,
          group: groupId,
          student_number: username,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRegistered(true);
        setFullName("");
        setGroupId("");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
      } else {
        const errorText = data?.detail || Object.values(data).flat().join("\n");
        alert("Ошибка регистрации:\n" + errorText);
      }
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      alert("Ошибка сети или сервера. Попробуйте позже.");
    }
  };

  if (registered) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h2>Регистрация отправлена</h2>
          <p style={{ color: "white", textAlign: "center" }}>
            Ожидайте подтверждения от администратора.
          </p>
          <button onClick={() => setIsRegistering(false)}>Назад ко входу</button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <form
        className={`login-form ${isRegistering ? "registering" : ""}`}
        onSubmit={isRegistering ? handleRegister : handleLogin}
      >
        <h2>{isRegistering ? "Регистрация" : "NorVoice"}</h2>

        <input
          type="text"
          placeholder="Номер зачётки"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        {isRegistering && (
          <>
            <input
              type="text"
              placeholder="ФИО"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="fade"
            />

            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              required
              className="fade"
            >
              <option value="">Выберите группу</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </>
        )}

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {isRegistering && (
          <input
            type="password"
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="fade"
          />
        )}

        <button type="submit">
          {isRegistering ? "Зарегистрироваться" : "Войти"}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsRegistering((prev) => !prev);
            setRegistered(false);
            setUsername("");
            setPassword("");
            setConfirmPassword("");
            setFullName("");
            setGroupId("");
          }}
        >
          {isRegistering ? "Назад ко входу" : "Нет аккаунта? Регистрация"}
        </button>
      </form>
    </div>
  );
}

export default Login;
