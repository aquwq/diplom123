import React, { useState, useEffect } from "react";
import "./AddUser.css";

function AddUser({ onBack }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access");

    async function fetchUsers() {
      try {
        // Активные пользователи
        const res = await fetch("http://localhost:8000/accounts/api/users/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const formatted = data.map(u => ({
          id: u.id,
          name: u.name,
          username: u.username,
          role: u.role,
          group: u.group || "—",
          student_number: u.student_number || "—",
          position: u.position || "—",
          is_active: u.is_active,
          is_staff: u.is_staff,
        }));

        // Неактивные (pending)
        const rp = await fetch("http://localhost:8000/adminpanel/api/pending_users/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!rp.ok) throw new Error();
        const pd = await rp.json();
        const pending = pd.map(u => ({
          id: u.id,
          name: u.name,
          username: u.username,
          role: u.role,
          group: u.group || "—",
          student_number: u.student_number || "—",
          position: u.position || "—",
          is_active: u.is_active,
          is_staff: u.is_staff,
        }));

        setUsers([...pending, ...formatted]);
      } catch (err) {
        console.error(err);
        alert("Не удалось загрузить пользователей.");
      }
    }

    fetchUsers();
  }, []);

  const toggleSelect = id => {
    setSelectedIds(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDelete = () => {
    const token = localStorage.getItem("access");
    selectedIds.forEach(id => {
      fetch(`http://localhost:8000/adminpanel/api/delete/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error();
          setUsers(u => u.filter(x => x.id !== id));
          setSelectedIds(s => { s.delete(id); return new Set(s); });
        })
        .catch(() => alert("Не удалось удалить"));
    });
  };

  const handleEdit = user => {
    setEditingUser(user);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setEditingUser(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = async e => {
    e.preventDefault();
    const token = localStorage.getItem("access");
    console.log("Saving user", editingUser);

    try {
      const res = await fetch(
        `http://localhost:8000/adminpanel/api/update/${editingUser.id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(editingUser)
        }
      );

      console.log("Status:", res.status);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Ошибка при сохранении");
      }

      const updated = await res.json();
      console.log("Updated from server:", updated);

      // Подгружаем новые данные в таблицу
      setUsers(u =>
        u.map(x =>
          x.id === updated.id
            ? {
                id: updated.id,
                name: updated.name,
                username: updated.username,
                role: updated.role,
                group: updated.group || "—",
                student_number: updated.student_number || "—",
                position: updated.position || "—",
                is_active: updated.is_active,
                is_staff: updated.is_staff
              }
            : x
        )
      );
      setEditingUser(null);
    } catch (err) {
      console.error("Save error:", err);
      alert("Не удалось сохранить изменения:\n" + err.message);
    }
  };

  const handleApproveUser = user => {
    const token = localStorage.getItem("access");
    fetch(`http://localhost:8000/adminpanel/api/${user.id}/activate/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ is_active: true })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        setUsers(u =>
          u.map(x => (x.id === user.id ? { ...x, is_active: true } : x))
        );
      })
      .catch(() => alert("Не удалось подтвердить"));
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="add-user-container">
      <h2>Управление пользователями</h2>

      <div className="search-box">
        <input
          type="text"
          placeholder="Поиск по ФИО"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {editingUser ? (
        <div className="edit-form">
          <h3>Редактирование пользователя</h3>
          <form onSubmit={handleSave}>
            {[
              "name",
              "username",
              "role",
              "student_number",
              "group",
              "position"
            ].map(f => (
              <label key={f}>
                {f.replace(/_/g, " ")}:
                <input
                  type={f === "is_active" || f === "is_staff" ? "checkbox" : "text"}
                  name={f}
                  value={editingUser[f]}
                  checked={
                    f === "is_active" || f === "is_staff"
                      ? editingUser[f]
                      : undefined
                  }
                  onChange={handleChange}
                />
              </label>
            ))}
            <button type="submit">Сохранить</button>
            <button type="button" onClick={() => setEditingUser(null)}>
              Отменить
            </button>
          </form>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th />
                <th>ФИО</th>
                <th>Логин</th>
                <th>Роль</th>
                <th>Группа</th>
                <th>Зачётка</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <React.Fragment key={u.id}>
                  <tr
                    className={`${
                      expandedId === u.id ? "expanded-row" : ""
                    } ${!u.is_active ? "new-user" : ""}`}
                    onClick={() =>
                      setExpandedId(expandedId === u.id ? null : u.id)
                    }
                  >
                    <td onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(u.id)}
                        onChange={() => toggleSelect(u.id)}
                      />
                    </td>
                    <td>{u.name}</td>
                    <td>{u.username}</td>
                    <td>{u.role}</td>
                    <td>{u.group}</td>
                    <td>{u.student_number}</td>
                    <td>
                      <button
                        className="edit-button"
                        onClick={e => {
                          e.stopPropagation();
                          handleEdit(u);
                        }}
                      >
                        ⚙️
                      </button>
                      {!u.is_active && (
                        <button
                          className="approve-button"
                          title="Подтвердить"
                          onClick={e => {
                            e.stopPropagation();
                            handleApproveUser(u);
                          }}
                        >
                          ✔️
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedId === u.id && (
                    <tr className="details-row">
                      <td colSpan={7}>
                        <div className="details">
                          <p>
                            <strong>ID:</strong> {u.id}
                          </p>
                          <p>
                            <strong>Должность:</strong> {u.position}
                          </p>
                          <p>
                            <strong>Активен:</strong> {u.is_active ? "Да" : "Нет"}
                          </p>
                          <p>
                            <strong>Сотрудник:</strong> {u.is_staff ? "Да" : "Нет"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="buttons-row">
        <button
          className="delete-button"
          disabled={selectedIds.size === 0}
          onClick={handleDelete}
        >
          Удалить выбранного
        </button>
        <button className="back-button" onClick={onBack}>
          Назад
        </button>
      </div>
    </div>
  );
}

export default AddUser;
