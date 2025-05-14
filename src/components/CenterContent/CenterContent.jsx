import React, { useState, useEffect, useRef } from "react";
import "./CenterContent.css";
import UserTiles from "./UserTiles";
import UserStreamView from "./UserStreamView";

export default function CenterContent({ isTranslating, onCloseTranslating, currentChannel }) {
  // 🔷 Refs
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const ws = useRef(null);
  const peers = useRef({});
  const screenStream = useRef(null);
  const webcamStream = useRef(null);
  const micStream = useRef(null);

  // 🔷 States
  const [isMicOn, setIsMicOn] = useState(false);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [activeUser, setActiveUser] = useState(null);

  const token = localStorage.getItem("access");

  // 🔷 WebSocket Setup
  useEffect(() => {
    if (!isTranslating || !currentChannel) return;

    ws.current = new WebSocket(
      `ws://localhost:8000/ws/communication/channels/${currentChannel}/?token=${token}`
    );

    ws.current.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    ws.current.onmessage = async ({ data }) => {
      const msg = JSON.parse(data);
      console.log("📨 WS received:", msg);

      if (msg.type === "participants_update") {
        setParticipants(msg.participants);
        msg.participants.forEach((name) => {
          if (!peers.current[name] && name !== currentChannel) {
            createPeer(name);
          }
        });
      }

      if (msg.type === "signal") {
        const { from, signal_type, signal_data } = msg;
        if (from === currentChannel) return;

        const pc = peers.current[from];
        if (!pc) return console.warn("⚠️ No peer for", from);

        if (signal_type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(signal_data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal("answer", from, pc.localDescription);
        }

        if (signal_type === "answer" && pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(signal_data));
        }

        if (signal_type === "ice" && pc.remoteDescription) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(signal_data));
          } catch (err) {
            console.error("❌ ICE add failed:", err);
          }
        }
      }
    };

    ws.current.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
    };

    return () => {
      Object.values(peers.current).forEach((pc) => pc.close());
      peers.current = {};
      ws.current && ws.current.close();
      stopAllStreams();
    };
  }, [isTranslating, currentChannel, token]);

  // 🔷 Peer Connection Logic
  async function createPeer(name) {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal("ice", name, e.candidate.toJSON());
    };

    pc.ontrack = (e) => {
      const stream = e.streams[0];
      if (!stream) return;

      if (!peers.current[name].streams) {
        peers.current[name].streams = [];
      }

      peers.current[name].streams.push(stream);

      stream.getTracks().forEach((track) => {
        if (track.kind === "video" && !videoRef.current.srcObject) {
          videoRef.current.srcObject = stream;
        }
        if (track.kind === "audio" && !audioRef.current.srcObject) {
          audioRef.current.srcObject = stream;
        }
      });
    };

    peers.current[name] = pc;
    if (screenStream.current || webcamStream.current || micStream.current) {
      await addAllTracks(pc);
    } else {
      console.warn("⚠️ Нет доступных потоков для добавления в PeerConnection");
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal("offer", name, pc.localDescription);
  }

  async function addAllTracks(pc) {
    [screenStream.current, webcamStream.current, micStream.current].forEach((stream) => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          try {
            pc.addTrack(track, stream);
          } catch (e) {
            console.error("❌ addTrack failed:", e);
          }
        });
      }
    });
  }

  function sendSignal(signalType, to, data) {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          signal_type: signalType,
          signal_data: data,
          to,
        })
      );
    }
  }

  // 🔷 Media Control Functions
  function stopAllStreams() {
    [screenStream.current, webcamStream.current, micStream.current].forEach((stream) => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    });
  }

  // 🔷 Toggle Functions for Controls
  const toggleMic = () => {
    if (micStream.current) {
      micStream.current.getTracks().forEach((track) => track.stop());
      micStream.current = null;
    } else {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          micStream.current = stream;
          audioRef.current.srcObject = stream;
        })
        .catch((err) => console.error("❌ Error accessing microphone:", err));
    }
    setIsMicOn(!isMicOn);
  };

  const toggleWebcam = () => {
    if (webcamStream.current) {
      webcamStream.current.getTracks().forEach((track) => track.stop());
      webcamStream.current = null;
    } else {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          webcamStream.current = stream;
          videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error("❌ Error accessing webcam:", err));
    }
    setIsWebcamOn(!isWebcamOn);
  };

  const toggleScreenSharing = () => {
    if (screenStream.current) {
      screenStream.current.getTracks().forEach((track) => track.stop());
      screenStream.current = null;
    } else {
      navigator.mediaDevices
        .getDisplayMedia({ video: true })
        .then((stream) => {
          screenStream.current = stream;
          videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error("❌ Error accessing screen:", err));
    }
    setIsScreenSharing(!isScreenSharing);
  };

  // 🔷 Handle User Click
  const handleUserClick = (username) => {
    const streams = peers.current[username]?.streams || [];

    if (streams) {
      const screenStream = streams.find((s) => s.getVideoTracks().some((t) => t.label.includes("Screen")));
      const webcamStream = streams.find((s) => s.getVideoTracks().some((t) => !t.label.includes("Screen")));

      setActiveUser({
        username,
        screenStream,
        webcamStream,
      });
    }
  };

// 🔷 Render
return (
  <div className="center-content">
    {isTranslating ? (
      <div className="conference-view">
        <h2 className="conference-title">
          Трансляция канала "{currentChannel}"
        </h2>

        <audio ref={audioRef} autoPlay playsInline controls={false} />

        <div className="user-tiles-wrapper">
          <UserTiles
            participants={participants}
            activeUser={activeUser}
            onUserClick={handleUserClick}
            streams={participants.reduce((acc, participant) => {
              const peer = peers.current[participant.username];
              if (peer && peer.streams.length > 0) {
                acc[participant.username] = peer.streams[0];
              }
              return acc;
            }, {})}
          />
        </div>

        {activeUser && (
          <UserStreamView
            user={activeUser.username}
            screenStream={activeUser.screenStream}
            webcamStream={activeUser.webcamStream}
            onClose={() => setActiveUser(null)}
          />
        )}

        <div className="controls">
        <button
  className={`screen-button ${isMicOn ? "mic-on" : "mic-off"}`}
  onClick={toggleMic}
>
  {isMicOn ? "Выключить микрофон" : "Включить микрофон"}
</button>
<button
  className={`webcam-button ${isWebcamOn ? "webcam-on" : "webcam-off"}`}
  onClick={toggleWebcam}
>
  {isWebcamOn ? "Выключить вебку" : "Включить вебку"}
</button>
<button
  className={`screen-button ${isScreenSharing ? "screen-on" : "screen-off"}`}
  onClick={toggleScreenSharing}
>
  {isScreenSharing ? "Остановить трансляцию" : "Поделиться экраном"}
</button>
<button className="back-button go-home" onClick={onCloseTranslating}>
  На главную
</button>
        </div>
      </div>
    ) : (
      <div className="logo-wrapper">
        <img
          src="/logotip.svg"
          alt="ISITvoice Logo"
          className="logo-animated"
          draggable="false"
        />
      </div>
    )}
  </div>
);
}
