import React, { useState, useEffect } from "react";
import "./ChannelManager.css";

function ChannelManager({ onBack }) {
  const [channels, setChannels] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // {id, username}
  const [allGroups, setAllGroups] = useState([]); // {id, name}
  const [search, setSearch] = useState("");
  const [editingChannel, setEditingChannel] = useState(null);

  const [selectedAllowedUsers, setSelectedAllowedUsers] = useState([]);
  const [selectedAllowedGroups, setSelectedAllowedGroups] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("access");

    const fetchChannels = fetch("http://localhost:8000/communication/channels/", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json());

    const fetchUsers = fetch("http://localhost:8000/accounts/api/users/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => data.map((u) => ({ id: u.id, username: u.username })));

    const fetchGroups = fetch("http://localhost:8000/adminpanel/api/groups/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => data.map((g) => ({ id: g.id, name: g.name })));

    Promise.all([fetchChannels, fetchUsers, fetchGroups])
      .then(([chs, users, groups]) => {
        setChannels(chs);
        setAllUsers(users);
        setAllGroups(groups);
      })
      .catch((err) => {
        console.error(err);
        alert("Ошибка загрузки данных");
      });
  }, []);

  const filtered = channels.filter((c) =>
    c.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleEdit = (c) => {
    setEditingChannel({
      ...c,
      maxParticipants: c.maxParticipants ?? 50,
      allowedUsers: c.allowedUsers || [],
      allowedGroups: c.allowedGroups || [],
    });
    setSelectedAllowedUsers([]);
    setSelectedAllowedGroups([]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access");
    const isNew = !editingChannel.id;
    const url = isNew
      ? "http://localhost:8000/communication/channels/create/"
      : `http://localhost:8000/communication/channels/${editingChannel.id}/`;
    const method = isNew ? "POST" : "PUT";

    const payload = {
      name: editingChannel.name,
      description: editingChannel.description,
      max_participants: editingChannel.maxParticipants,
      users_allowed: editingChannel.allowedUsers.map((username) => {
        const user = allUsers.find((u) => u.username === username);
        return user?.id;
      }).filter(Boolean),
      groups_allowed: editingChannel.allowedGroups.map((groupName) => {
        const group = allGroups.find((g) => g.name === groupName);
        return group?.id;
      }).filter(Boolean),
    };

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      return alert("Ошибка сохранения: " + err);
    }

    const saved = await res.json();
    setChannels((chs) =>
      isNew ? [saved, ...chs] : chs.map((x) => (x.id === saved.id ? saved : x))
    );
    setEditingChannel(null);
  };

  const moveItems = (fromKey, toKey, selectedItems, setSelectedFrom, setSelectedTo) => {
    setEditingChannel((prev) => ({
      ...prev,
      [fromKey]: prev[fromKey].filter((item) => !selectedItems.includes(item)),
      [toKey]: [
        ...prev[toKey],
        ...selectedItems.filter((item) => !prev[toKey].includes(item)),
      ],
    }));
    setSelectedFrom([]);
    setSelectedTo((prev) => [
      ...prev,
      ...selectedItems.filter((item) => !prev.includes(item)),
    ]);
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
              onChange={(e) => setSearch(e.target.value)}
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
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.description}</td>
                    <td>{c.maxParticipants}</td>
                    <td>
                      <button className="edit-button" onClick={() => handleEdit(c)}>
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
                onChange={(e) =>
                  setEditingChannel((prev) => ({
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
                onChange={(e) =>
                  setEditingChannel((prev) => ({
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
                onChange={(e) =>
                  setEditingChannel((prev) => ({
                    ...prev,
                    maxParticipants: Number(e.target.value),
                  }))
                }
              />
            </label>

            {/* Users allowed */}
            <div className="dual-list">
              <div>
                <h4>Разрешённые пользователи</h4>
                <select
                  multiple
                  size={5}
                  value={editingChannel.allowedUsers}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (o) => o.value);
                    setEditingChannel((prev) => ({
                      ...prev,
                      allowedUsers: selected,
                    }));
                    setSelectedAllowedUsers(selected);
                  }}
                >
                  {allUsers.map((u) => (
                    <option key={u.username} value={u.username}>
                      {u.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Groups allowed */}
            <div className="dual-list">
              <div>
                <h4>Разрешённые группы</h4>
                <select
                  multiple
                  size={5}
                  value={editingChannel.allowedGroups}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (o) => o.value);
                    setEditingChannel((prev) => ({
                      ...prev,
                      allowedGroups: selected,
                    }));
                    setSelectedAllowedGroups(selected);
                  }}
                >
                  {allGroups.map((g) => (
                    <option key={g.name} value={g.name}>
                      {g.name}
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
