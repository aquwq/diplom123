import React, { useEffect, useState } from "react";
import ChannelItem from "./ChannelItem";
import "./ChannelList.css";

function ChannelList({ onChannelClick }) {
  const [channels, setChannels] = useState([]);

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

  return (
    <div className="channel-list">
      {channels.map((channel) => (
        <ChannelItem
          key={channel.id}
          name={channel.name}
          onClick={() => onChannelClick(channel.id)} // 👈 передаём id, не name
        />
      ))}
    </div>
  );
}

export default ChannelList;
