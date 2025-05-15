// CenterContent.jsx
import React, { useState, useEffect, useRef } from "react";
import "./CenterContent.css";
import UserTiles from "./UserTiles";
import UserStreamView from "./UserStreamView";

export default function CenterContent({
  isTranslating,
  onCloseTranslating,
  currentChannel,
  panelVisible,
}) {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("access");

  const ws = useRef(null);
  const peers = useRef({});
  const micStream = useRef(null);
  const webcamStream = useRef(null);
  const screenStream = useRef(null);

  const [isMicOn, setIsMicOn] = useState(false);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState([]);       // ["alice","bob",...]
  const [activeUser, setActiveUser] = useState(null);         // { username, stream }
  const [streamsMap, setStreamsMap] = useState({});           // { alice: MediaStream, ... }

  // ─── WebSocket + signaling ───────────────────────────────────
  useEffect(() => {
    if (!isTranslating || !currentChannel) return;
    ws.current = new WebSocket(
      `ws://localhost:8000/ws/communication/channels/${currentChannel}/?token=${token}`
    );
    ws.current.onopen = () => console.log("✅ WS connected");
    ws.current.onerror = e => console.error("❌ WS error", e);
    ws.current.onmessage = async ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.type === "participants_update") {
        setParticipants(msg.participants);
        msg.participants.forEach(name => {
          if (!peers.current[name] && name !== msg.you) createPeer(name);
        });
      }
      if (msg.type === "signal") {
        const { from, signal_type, signal_data } = msg;
        const pc = peers.current[from];
        if (!pc) return;
        if (signal_type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(signal_data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal("answer", from, pc.localDescription);
        } else if (signal_type === "answer" && pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(signal_data));
        } else if (signal_type === "ice" && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(signal_data));
        }
      }
    };
    return () => {
      Object.values(peers.current).forEach(pc => pc.close());
      peers.current = {};
      ws.current?.close();
      stopAllStreams();
    };
  }, [isTranslating, currentChannel, token]);

  // ─── Создание peer и добавление локальных треков ────────────────
  async function createPeer(name) {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pc.onicecandidate = e => {
      if (e.candidate) sendSignal("ice", name, e.candidate.toJSON());
    };
    pc.ontrack = e => {
      const stream = e.streams[0];
      if (!stream) return;
      setStreamsMap(prev => ({ ...prev, [name]: stream }));
    };
    peers.current[name] = pc;
    await addLocalTracks(pc);
    [micStream.current, webcamStream.current, screenStream.current].forEach(stream => {
      if (stream) stream.getTracks().forEach(track => pc.addTrack(track, stream));
    });
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal("offer", name, pc.localDescription);
  }

  // ─── Обновление треков после toggle ────────────────────────────
  async function updateTracks() {
    for (const [name, pc] of Object.entries(peers.current)) {
      const senders = pc.getSenders();
      [micStream.current, webcamStream.current, screenStream.current].forEach(stream => {
        if (stream) {
          stream.getTracks().forEach(async track => {
            const sender = senders.find(s => s.track?.kind === track.kind);
            if (sender) await sender.replaceTrack(track);
            else pc.addTrack(track, stream);
          });
        }
      });
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal("offer", name, pc.localDescription);
    }
  }

  function sendSignal(type, to, data) {
    ws.current?.readyState === WebSocket.OPEN &&
      ws.current.send(JSON.stringify({ signal_type: type, signal_data: data, to }));
  }

  function stopAllStreams() {
    [micStream.current, webcamStream.current, screenStream.current].forEach(s => {
      if (s) s.getTracks().forEach(t => t.stop());
    });
    setStreamsMap({});
  }

  // ─── Toggle handlers ────────────────────────────────────────────
  const toggleMic = async () => {
    if (micStream.current) {
      micStream.current.getTracks().forEach(t => t.stop());
      micStream.current = null;
      setIsMicOn(false);
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStream.current = s;
        setIsMicOn(true);
      } catch (e) { console.error(e); }
    }
    await updateTracks();
  };

  const toggleWebcam = async () => {
    if (webcamStream.current) {
      webcamStream.current.getTracks().forEach(t => t.stop());
      webcamStream.current = null;
      setIsWebcamOn(false);
      setStreamsMap(prev => { const next = { ...prev }; delete next[username]; return next; });
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        webcamStream.current = s;
        setIsWebcamOn(true);
        setStreamsMap(prev => ({ ...prev, [username]: s }));
      } catch (e) { console.error(e); }
    }
    await updateTracks();
  };

  const toggleScreenSharing = async () => {
    if (screenStream.current) {
      screenStream.current.getTracks().forEach(t => t.stop());
      screenStream.current = null;
      setIsScreenSharing(false);
      setStreamsMap(prev => { const next = { ...prev }; delete next[username]; return next; });
    } else {
      try {
        const s = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStream.current = s;
        setIsScreenSharing(true);
        setStreamsMap(prev => ({ ...prev, [username]: s }));
      } catch (e) { console.error(e); }
    }
    await updateTracks();
  };

  // ─── Клик по пользователю ────────────────────────────────────────
  const handleUserClick = user => {
    if (activeUser?.username === user) setActiveUser(null);
    else setActiveUser({ username: user, stream: streamsMap[user] || null });
  };

  // класс, зависящий от видимости левой панели
  const containerClass = panelVisible
    ? "center-content with-panel"
    : "center-content full-width";

  return (
    <div className={`${containerClass} ${isTranslating ? "translating" : ""}`}>
      {isTranslating ? (
        <div className="conference-view">
          <h2 className="conference-title">
            Трансляция канала "{currentChannel}"
          </h2>
          <div className="user-tiles-container">
            <UserTiles
              participants={participants}
              activeUser={activeUser?.username}
              onUserClick={handleUserClick}
              streams={streamsMap}
              username={username}
              isWebcamOn={isWebcamOn}
              webcamStream={webcamStream.current}
            />
          </div>
          <div className="user-stream-wrapper">
            {activeUser ? (
              <UserStreamView
                user={activeUser.username}
                screenStream={activeUser.stream}
                onClose={() => setActiveUser(null)}
              />
            ) : (
              <div className="no-video-placeholder">
                Выберите пользователя, чтобы увидеть подробнее...
              </div>
            )}
          </div>
          <div className="controls">
            <button onClick={toggleScreenSharing}>
              {isScreenSharing ? "Остановить трансляцию" : "Поделиться экраном"}
            </button>
            <button onClick={toggleMic}>
              {isMicOn ? "Выключить микрофон" : "Включить микрофон"}
            </button>
            <button onClick={toggleWebcam}>
              {isWebcamOn ? "Выключить вебку" : "Включить вебку"}
            </button>
            <button className="back-button" onClick={onCloseTranslating}>
              На главную
            </button>
          </div>
        </div>
      ) : (
        <div className="logo-wrapper">
          <img
            src="/logotip.svg"
            alt="Logo"
            className="logo-animated"
            draggable="false"
          />
        </div>
      )}
    </div>
  );
}
