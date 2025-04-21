import React from "react";
import ChannelItem from "./ChannelItem";
import "./ChannelList.css";

function ChannelList({ onChannelClick }) {
  const channels = [
    { id: 1, name: "General" },
    { id: 2, name: "Announcements" },
    { id: 3, name: "Help" },
    { id: 4, name: "Random" },
    { id: 5, name: "Random2" },
    { id: 6, name: "Music" },
{ id: 7, name: "Gaming" },
{ id: 8, name: "Development" },
{ id: 9, name: "Design" },
{ id: 10, name: "Feedback" },
{ id: 11, name: "Off-Topic" },
{ id: 12, name: "Tech-Support" },
{ id: 13, name: "Memes" },
{ id: 14, name: "Sports" },
{ id: 15, name: "Movies" },
{ id: 16, name: "Travel" },
{ id: 17, name: "Books" },
{ id: 18, name: "Food" },
{ id: 19, name: "Fitness" },
{ id: 20, name: "Study" }

  ];

  return (
    <div className="channel-list">
      {channels.map((channel) => (
        <ChannelItem
          key={channel.id}
          name={channel.name}
          onClick={() => onChannelClick(channel.name)}
        />
      ))}
    </div>
  );
}

export default ChannelList;
