import React, { useEffect, useState } from "react";
import ChannelItem from "./ChannelItem";
import "./ChannelList.css";

function ChannelList({ onChannelClick, onChannelConnect }) {
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [connectedChannelId, setConnectedChannelId] = useState(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await fetch("http://localhost:8000/communication/channels/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Ошибка при получении каналов");
        }

        const data = await response.json();
        setChannels(data);
      } catch (error) {
        console.error("Ошибка загрузки каналов:", error);
      }
    };

    fetchChannels();
  }, []);

  const handleChannelClick = (id) => {
    setActiveChannel(id);
    onChannelClick(id);
  };

  const handleConnectClick = (id) => {
    if (connectedChannelId === id) {
      setConnectedChannelId(null); // Отключаемся
      onChannelConnect(null); // Передаём null для отключения
    } else {
      setConnectedChannelId(id); // Подключаемся
      onChannelConnect(id);
    }
  };

  return (
    <div className="channel-list">
      {channels.map((channel) => (
        <ChannelItem
          key={channel.id}
          name={channel.name}
          isActive={channel.id === activeChannel}
          isConnected={channel.id === connectedChannelId}
          onClick={() => handleChannelClick(channel.id)}
          onConnect={() => handleConnectClick(channel.id)}
        />
      ))}
    </div>
  );
}

export default ChannelList;
