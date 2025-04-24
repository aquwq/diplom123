import React, { useState } from "react";
import "./ChannelManager.css";

function ChannelManager({ onBack }) {
  const [channels, setChannels] = useState([
    {
      id: 1,
      name: "Лекция 1",
      roles: "студент, преподаватель",
      capacity: 50,
      expanded: false,
    },
    {
      id: 2,
      name: "Общий чат",
      roles: "все",
      capacity: 100,
      expanded: false,
    },
  ]);

  const handleAddChannel = () => {
    const newChannel = {
      id: Date.now(),
      name: "Новый канал",
      roles: "",
      capacity: 0,
      expanded: true,
    };
    setChannels([newChannel, ...channels]);
  };

  const handleDeleteChannel = (id) => {
    setChannels(channels.filter((channel) => channel.id !== id));
  };

  const handleToggleExpand = (id) => {
    setChannels(
      channels.map((ch) =>
        ch.id === id ? { ...ch, expanded: !ch.expanded } : ch
      )
    );
  };

  const handleChange = (id, field, value) => {
    setChannels(
      channels.map((ch) =>
        ch.id === id ? { ...ch, [field]: value } : ch
      )
    );
  };

  return (
    <div className="channel-manager-container">
      <h2>Управление каналами</h2>

      <div className="add-channel-box" onClick={handleAddChannel}>
        + Создать новый канал
      </div>

      <div className="channel-list-scroll">
        {channels.map((channel) => (
          <div key={channel.id} className="channel-item">
            <div className="channel-header">
              <span onClick={() => handleToggleExpand(channel.id)}>
                {channel.name}
              </span>
              <button
                className="delete-button"
                onClick={() => handleDeleteChannel(channel.id)}
              >
                ✖
              </button>
            </div>

            {channel.expanded && (
              <div className="channel-settings">
                <input
                  type="text"
                  placeholder="Название канала"
                  value={channel.name}
                  onChange={(e) =>
                    handleChange(channel.id, "name", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Роли, которые могут подключаться"
                  value={channel.roles}
                  onChange={(e) =>
                    handleChange(channel.id, "roles", e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="Максимум участников"
                  value={channel.capacity}
                  onChange={(e) =>
                    handleChange(channel.id, "capacity", e.target.value)
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="back-button" onClick={onBack}>
        Назад
      </button>
    </div>
  );
}

export default ChannelManager;
