import React, { useState } from "react";
import "./AddUser.css";

const initialUsers = [
  { id: 1, fullName: "Иванов Иван Иванович", recordBook: "RB001", group: "A-1", isTeacher: false, email: "ivanov@example.com" },
  { id: 2, fullName: "Петров Петр Петрович", recordBook: "RB002", group: "B-2", isTeacher: true, email: "petrov@example.com" },
  { id: 3, fullName: "Сидорова Мария Сергеевна", recordBook: "RB003", group: "C-3", isTeacher: false, email: "sidorova@example.com" },
  // …можно добавить ещё
];

function AddUser({ onBack }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingUser, setEditingUser] = useState(null);

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(search.trim().toLowerCase())
  );

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const handleDelete = () => {
    if (selectedIds.size === 0) return;
    setUsers(users.filter(u => !selectedIds.has(u.id)));
    setSelectedIds(new Set());
    if (expandedId && selectedIds.has(expandedId)) {
      setExpandedId(null);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updatedUsers = users.map(user => 
      user.id === editingUser.id ? editingUser : user
    );
    setUsers(updatedUsers);
    setEditingUser(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingUser(prev => ({ ...prev, [name]: value }));
  };

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
            <label>
              ФИО:
              <input 
                type="text" 
                name="fullName" 
                value={editingUser.fullName} 
                onChange={handleChange} 
              />
            </label>
            <label>
              Зачётка:
              <input 
                type="text" 
                name="recordBook" 
                value={editingUser.recordBook} 
                onChange={handleChange} 
              />
            </label>
            <label>
              Группа:
              <input 
                type="text" 
                name="group" 
                value={editingUser.group} 
                onChange={handleChange} 
              />
            </label>
            <label>
              Преподаватель:
              <input 
                type="checkbox" 
                name="isTeacher" 
                checked={editingUser.isTeacher} 
                onChange={e => setEditingUser({ ...editingUser, isTeacher: e.target.checked })} 
              />
            </label>
            <label>
              Email:
              <input 
                type="email" 
                name="email" 
                value={editingUser.email} 
                onChange={handleChange} 
              />
            </label>
            <button type="submit">Сохранить</button>
            <button type="button" onClick={() => setEditingUser(null)}>Отменить</button>
          </form>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th></th>
                <th>ФИО</th>
                <th>Зачётка</th>
                <th>Группа</th>
                <th>Преп.</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <React.Fragment key={u.id}>
                  <tr
                    className={expandedId === u.id ? "expanded-row" : ""}
                    onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
                  >
                    <td onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(u.id)}
                        onChange={() => toggleSelect(u.id)}
                      />
                    </td>
                    <td>{u.fullName}</td>
                    <td>{u.recordBook}</td>
                    <td>{u.group}</td>
                    <td>{u.isTeacher ? "Да" : "Нет"}</td>
                    <td>
                      <button className="edit-button" onClick={() => handleEdit(u)}>
                        ⚙️
                      </button>
                    </td>
                  </tr>
                  {expandedId === u.id && (
                    <tr className="details-row">
                      <td colSpan="6">
                        <div className="details">
                          <p><strong>Email:</strong> {u.email}</p>
                          <p><strong>ID пользователя:</strong> {u.id}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-message">
                    Пользователи не найдены
                  </td>
                </tr>
              )}
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
