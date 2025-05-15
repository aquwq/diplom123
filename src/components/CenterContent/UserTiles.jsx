import React, { useRef, useEffect } from "react";
import "./UserTiles.css";

export default function UserTiles({
  participants,
  activeUser,
  onUserClick,
  streams,      // streamsMap из CenterContent
  username,     // ваше имя
}) {
  return (
    <div className="user-tiles">
      {participants.map((participant) => {
        const stream = streams[participant];
        const isLocal = participant === username;
        const hasStream = Boolean(stream);

        // Для отладки
        console.log("[UserTiles] participant=", participant,
                    "isLocal=", isLocal,
                    "hasStream=", hasStream,
                    "streamsMap keys=", Object.keys(streams));

        return (
          <div
            key={participant}
            className={`user-tile ${
              activeUser === participant ? "active" : ""
            } ${hasStream ? "transmitting" : ""}`}
            onClick={() => onUserClick(participant)}
          >
            {hasStream ? (
              isLocal ? (
                // Локальный пользователь — только метка
                <div className="streaming-label">ИДЕТ СТРИМ</div>
              ) : (
                // Другие — видео
                <VideoTile stream={stream} muted={false} />
              )
            ) : (
              <div className="no-video">Нет видео</div>
            )}
            <div className="user-name">{participant}</div>
          </div>
        );
      })}
    </div>
  );
}

function VideoTile({ stream, muted }) {
  const ref = useRef();
  
  useEffect(() => {
    if (ref.current) {
      if (stream) {
        ref.current.srcObject = stream;
      } else {
        ref.current.srcObject = null;
      }
    }
  }, [stream]);

  return <video ref={ref} autoPlay playsInline muted={muted} />;
}