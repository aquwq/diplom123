import React from "react";
import "./UserTiles.css";

export default function UserTiles({ participants, activeUser, onUserClick, streams }) {
  return (
    <div className="user-tiles-wrapper">
      <div className="user-tiles">
        {participants.length > 0 ? (
          participants.map((participant) => (
            <div
              key={participant.username}
              className={`user-tile ${activeUser === participant.username ? "active" : ""}`}
              onClick={() => onUserClick(participant.username)}
            >
              <div className="user-avatar">
                <img
                  src={participant.avatar || "../public/user.svg"}
                  alt={participant.username}
                  className="avatar-img"
                />
              </div>
              <div className="user-name">{participant.username}</div>

              {streams[participant.username] && (
                <video
                  className="user-video"
                  autoPlay
                  playsInline
                  muted
                  ref={(video) => {
                    if (video && streams[participant.username] instanceof MediaStream) {
                      video.srcObject = streams[participant.username];
                    }
                  }}
                />
              )}
            </div>
          ))
        ) : (
          <div className="no-participants">Нет участников</div>
        )}
      </div>
      <div className="fade-left" />
      <div className="fade-right" />
    </div>
  );
}
