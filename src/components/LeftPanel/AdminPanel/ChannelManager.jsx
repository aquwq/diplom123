// ChannelManager.jsx
import React, { useState } from "react";
import "./ChannelManager.css";

const initialChannels = [
  { id: 1, name: "Канал 1", description: "Описание канала 1", isPrivate: false },
  { id: 2, name: "Канал 2", description: "Описание канала 2", isPrivate: true },
  { id: 3, name: "Канал 3", description: "Описание канала 3", isPrivate: false },
  // Можно добавить больше каналов
];

function ChannelManager({ onBack }) {
  const [channels, setChannels] = useState(initialChannels);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingChannel, setEditingChannel] = useState(null);

  const filtered = channels.filter(c =>
    c.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const handleDelete = () => {
    if (selectedIds.size === 0) return;
    setChannels(channels.filter(c => !selectedIds.has(c.id)));
    setSelectedIds(new Set());
    if (expandedId && selectedIds.has(expandedId)) {
      setExpandedId(null);
    }
  };

  const handleEdit = (channel) => {
    setEditingChannel(channel);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updatedChannels = channels.map(channel => 
      channel.id === editingChannel.id ? editingChannel : channel
    );
    setChannels(updatedChannels);
    setEditingChannel(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingChannel(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="channel-manager-container">
      <h2>Управление каналами</h2>

      <div className="search-box">
        <input
          type="text"
          placeholder="Поиск по имени канала"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {editingChannel ? (
        <div className="edit-form">
          <h3>Редактирование канала</h3>
          <form onSubmit={handleSave}>
            <label>
              Имя канала:
              <input 
                type="text" 
                name="name" 
                value={editingChannel.name} 
                onChange={handleChange} 
              />
            </label>
            <label>
              Описание:
              <input 
                type="text" 
                name="description" 
                value={editingChannel.description} 
                onChange={handleChange} 
              />
            </label>
            <label>
              Приватный:
              <input 
                type="checkbox" 
                name="isPrivate" 
                checked={editingChannel.isPrivate} 
                onChange={e => setEditingChannel({ ...editingChannel, isPrivate: e.target.checked })} 
              />
            </label>
            <button type="submit">Сохранить</button>
            <button type="button" onClick={() => setEditingChannel(null)}>Отменить</button>
          </form>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="channel-table">
            <thead>
              <tr>
                <th></th>
                <th>Имя канала</th>
                <th>Описание</th>
                <th>Приватность</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <React.Fragment key={c.id}>
                  <tr
                    className={expandedId === c.id ? "expanded-row" : ""}
                    onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                  >
                    <td onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(c.id)}
                        onChange={() => toggleSelect(c.id)}
                      />
                    </td>
                    <td>{c.name}</td>
                    <td>{c.description}</td>
                    <td>{c.isPrivate ? "Да" : "Нет"}</td>
                    <td>
                      <button className="edit-button" onClick={() => handleEdit(c)}>
                        ⚙️
                      </button>
                    </td>
                  </tr>
                  {expandedId === c.id && (
                    <tr className="details-row">
                      <td colSpan="6">
                        <div className="details">
                          <p><strong>ID канала:</strong> {c.id}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-message">
                    Каналы не найдены
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
          Удалить выбранные каналы
        </button>
        <button className="back-button" onClick={onBack}>
          Назад
        </button>
      </div>
    </div>
  );
}

export default ChannelManager;
