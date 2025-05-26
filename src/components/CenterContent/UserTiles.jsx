import React, { useRef, useEffect } from "react";
import "./UserTiles.css";

export default function UserTiles({
  participants,
  activeUser,
  onUserClick,
  streams,
  username,
}) {
  return (
    <div className="user-tiles">
      {participants.map((participant) => {
        const streamObj = streams[participant];
        const isLocal = participant === username;
        const webcamStream = streamObj?.webcam || null;
        const hasStream = Boolean(webcamStream);

        return (
          <div
            key={participant}
            className={`user-tile ${activeUser === participant ? "active" : ""} ${hasStream ? "transmitting" : ""}`}
            onClick={() => onUserClick(participant)}
          >
            {hasStream ? (
              isLocal ? (
                <div className="streaming-label">ИДЕТ СТРИМ</div>
              ) : (
                <VideoTile stream={webcamStream} muted={false} />
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
    const videoElement = ref.current;

    if (!videoElement) return;

    if (stream instanceof MediaStream) {
      videoElement.srcObject = stream;
    } else {
      console.warn("Невалидный stream в VideoTile:", stream);
      videoElement.srcObject = null;
    }
  }, [stream]);

  return <video ref={ref} autoPlay playsInline muted={muted} />;
}
