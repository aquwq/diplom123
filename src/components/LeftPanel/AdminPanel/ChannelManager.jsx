// ChannelManager.jsx
import React, { useState, useEffect } from "react";
import "./ChannelManager.css";

function ChannelManager({ onBack }) {
  const [channels, setChannels] = useState([]);
  const [allUsers, setAllUsers] = useState([]);       // список username
  const [allGroups, setAllGroups] = useState([]);     // список name
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [editingChannel, setEditingChannel] = useState(null);

  // Загрузка каналов, пользователей и групп
  useEffect(() => {
    const token = localStorage.getItem("access");

    // 1) Каналы
    const fetchChannels = fetch("http://localhost:8000/communication/channels/", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.json());

    // 2) Пользователи
    const fetchUsers = fetch("http://localhost:8000/accounts/api/users/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => data.map(u => u.username));

    // 3) Группы
    const fetchGroups = fetch("http://localhost:8000/adminpanel/api/groups/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => data.map(g => g.name));

    Promise.all([fetchChannels, fetchUsers, fetchGroups])
      .then(([chs, users, groups]) => {
        setChannels(chs);
        setAllUsers(users);
        setAllGroups(groups);
      })
      .catch(err => {
        console.error(err);
        alert("Ошибка загрузки данных");
      });
  }, []);

  const filtered = channels.filter(c =>
    c.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleEdit = c => {
    setEditingChannel({
      ...c,
      maxParticipants: c.maxParticipants ?? 0,
      // если нет — пустые массивы
      allowedUsers: c.allowedUsers || [],
      deniedUsers: c.deniedUsers || [],
      allowedGroups: c.allowedGroups || [],
      deniedGroups: c.deniedGroups || [],
    });
  };

  const handleSave = async e => {
    e.preventDefault();
    const token = localStorage.getItem("access");
    const isNew = !editingChannel.id;
    const url = isNew
      ? "http://localhost:8000/communication/channels/"
      : `http://localhost:8000/communication/channels/${editingChannel.id}/`;
    const method = isNew ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editingChannel),
    });
    if (!res.ok) {
      const err = await res.text();
      return alert("Ошибка сохранения: " + err);
    }
    const saved = await res.json();
    setChannels(chs =>
      isNew ? [saved, ...chs] : chs.map(x => (x.id === saved.id ? saved : x))
    );
    setEditingChannel(null);
  };

  const moveItems = (fromKey, toKey, selected) => {
    setEditingChannel(prev => ({
      ...prev,
      [fromKey]: prev[fromKey].filter(id => !selected.includes(id)),
      [toKey]: [...prev[toKey], ...selected],
    }));
  };

  return (
    <div className="channel-manager-container">
      <h2>Управление каналами</h2>

      {!editingChannel && (
        <>
          <div className="buttons-row top">
            <button onClick={() => handleEdit({})} className="create-button">
              Создать канал
            </button>
            <input
              type="text"
              placeholder="Поиск по имени канала"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-box"
            />
          </div>

          <div className="table-wrapper">
            <table className="channel-table">
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Описание</th>
                  <th>Max participants</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.description}</td>
                    <td>{c.maxParticipants}</td>
                    <td>
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(c)}
                      >
                        ⚙️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editingChannel && (
        <div className="edit-form">
          <h3>{editingChannel.id ? "Редактирование канала" : "Новый канал"}</h3>
          <form onSubmit={handleSave}>
            <label>
              Имя:
              <input
                type="text"
                name="name"
                value={editingChannel.name || ""}
                onChange={e =>
                  setEditingChannel(prev => ({
                    ...prev,
                    [e.target.name]: e.target.value,
                  }))
                }
                required
              />
            </label>

            <label>
              Описание:
              <input
                type="text"
                name="description"
                value={editingChannel.description || ""}
                onChange={e =>
                  setEditingChannel(prev => ({
                    ...prev,
                    [e.target.name]: e.target.value,
                  }))
                }
              />
            </label>

            <label>
              Max participants:
              <input
                type="number"
                name="maxParticipants"
                min="0"
                value={editingChannel.maxParticipants}
                onChange={e =>
                  setEditingChannel(prev => ({
                    ...prev,
                    maxParticipants: Number(e.target.value),
                  }))
                }
              />
            </label>

            {/* Participants allow/deny */}
            <div className="dual-list">
              <div>
                <h4>Allowed users</h4>
                <select
                  multiple
                  size={5}
                  value={editingChannel.allowedUsers}
                  onChange={e =>
                    setEditingChannel(prev => ({
                      ...prev,
                      allowedUsers: Array.from(
                        e.target.selectedOptions,
                        o => o.value
                      ),
                    }))
                  }
                >
                  {allUsers.map(u => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div className="dual-list-buttons">
                <button
                  type="button"
                  onClick={() =>
                    moveItems(
                      "deniedUsers",
                      "allowedUsers",
                      editingChannel.deniedUsers
                    )
                  }
                >
                  &larr;
                </button>
                <button
                  type="button"
                  onClick={() =>
                    moveItems(
                      "allowedUsers",
                      "deniedUsers",
                      editingChannel.allowedUsers
                    )
                  }
                >
                  &rarr;
                </button>
              </div>
              <div>
                <h4>Denied users</h4>
                <select multiple size={5} value={editingChannel.deniedUsers}>
                  {editingChannel.deniedUsers.map(u => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Groups allow/deny */}
            <div className="dual-list">
              <div>
                <h4>Allowed groups</h4>
                <select
                  multiple
                  size={5}
                  value={editingChannel.allowedGroups}
                  onChange={e =>
                    setEditingChannel(prev => ({
                      ...prev,
                      allowedGroups: Array.from(
                        e.target.selectedOptions,
                        o => o.value
                      ),
                    }))
                  }
                >
                  {allGroups.map(g => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="dual-list-buttons">
                <button
                  type="button"
                  onClick={() =>
                    moveItems(
                      "deniedGroups",
                      "allowedGroups",
                      editingChannel.deniedGroups
                    )
                  }
                >
                  &larr;
                </button>
                <button
                  type="button"
                  onClick={() =>
                    moveItems(
                      "allowedGroups",
                      "deniedGroups",
                      editingChannel.allowedGroups
                    )
                  }
                >
                  &rarr;
                </button>
              </div>
              <div>
                <h4>Denied groups</h4>
                <select
                  multiple
                  size={5}
                  value={editingChannel.deniedGroups}
                >
                  {editingChannel.deniedGroups.map(g => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="buttons-row bottom">
              <button type="submit">Сохранить</button>
              <button type="button" onClick={() => setEditingChannel(null)}>
                Отменить
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="buttons-row">
        <button className="back-button" onClick={onBack}>
          Назад
        </button>
      </div>
    </div>
  );
}

export default ChannelManager;
