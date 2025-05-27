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
  const [participants, setParticipants] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [userStreamsMap, setUserStreamsMap] = useState({});
  const [channelName, setChannelName] = useState("");


  useEffect(() => {
    if (!isTranslating || !currentChannel) return;

    const fetchChannelName = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/communication/channels/${currentChannel}/get/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setChannelName(data.name);
    } catch (err) {
      console.error("Ошибка загрузки названия канала:", err);
    }
  };

  fetchChannelName();

    ws.current = new WebSocket(
      `ws://localhost:8000/ws/communication/channels/${currentChannel}/?token=${token}`
    );

    ws.current.onopen = () => console.log("✅ WS connected");
    ws.current.onerror = (e) => console.error("❌ WS error", e);

    ws.current.onmessage = async ({ data }) => {
      const msg = JSON.parse(data);

      if (msg.type === "participants_update") {
        setParticipants(msg.participants);
        msg.participants.forEach((name) => {
          if (!peers.current[name]) peers.current[name] = {};
          ["webcam", "screen"].forEach((streamType) => {
            if (!peers.current[name][streamType] && name !== username) {
              createPeer(name, streamType);
            }
          });
        });
      }

      if (msg.type === "signal") {
        const { from, signal_type, signal_data, stream_type = "webcam" } = msg;
        if (!peers.current[from]) peers.current[from] = {};
        const pc = peers.current[from][stream_type];
        if (!pc) return;

        if (signal_type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(signal_data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal("answer", from, pc.localDescription, stream_type);
        } else if (signal_type === "answer" && pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(signal_data));
        } else if (signal_type === "ice" && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(signal_data));
        }
      }
    };

    return () => {
      Object.values(peers.current).forEach(userPeers =>
        Object.values(userPeers).forEach(pc => pc.close())
      );
      peers.current = {};
      ws.current?.close();
      stopAllStreams();
    };
  }, [isTranslating, currentChannel, token, username]);

  function subscribeTrackEnded(stream, user, streamType) {
    if (!stream) return;
    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setUserStreamsMap((prev) => {
          const next = { ...prev };
          if (next[user]) {
            delete next[user][streamType];
            if (Object.keys(next[user]).length === 0) delete next[user];
          }
          return next;
        });

        setActiveUser((current) => {
          if (!current) return current;
          if (current.username === user) {
            const newUser = { ...current };
            if (streamType === "webcam") newUser.webcamStream = null;
            if (streamType === "screen") newUser.screenStream = null;
            if (!newUser.webcamStream && !newUser.screenStream) return null;
            return newUser;
          }
          return current;
        });
      };
    });
  }

  useEffect(() => {
    Object.entries(userStreamsMap).forEach(([user, streams]) => {
      if (streams.webcam) subscribeTrackEnded(streams.webcam, user, "webcam");
      if (streams.screen) subscribeTrackEnded(streams.screen, user, "screen");
    });
  }, [userStreamsMap]);

  async function createPeer(name, streamType) {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal("ice", name, e.candidate.toJSON(), streamType);
      }
    };

    pc.ontrack = (e) => {
      const stream = e.streams[0];
      subscribeTrackEnded(stream, name, streamType);
      setUserStreamsMap((prev) => ({
        ...prev,
        [name]: {
          ...prev[name],
          [streamType]: stream,
        },
      }));
    };

    if (!peers.current[name]) peers.current[name] = {};
    peers.current[name][streamType] = pc;

    if (streamType === "webcam" && webcamStream.current) {
      webcamStream.current.getTracks().forEach((track) =>
        pc.addTrack(track, webcamStream.current)
      );
    } else if (streamType === "screen" && screenStream.current) {
      screenStream.current.getTracks().forEach((track) => {
        track.contentHint = "display";
        pc.addTrack(track, screenStream.current);
      });
    }

    if (micStream.current) {
      micStream.current.getTracks().forEach((track) =>
        pc.addTrack(track, micStream.current)
      );
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal("offer", name, pc.localDescription, streamType);
  }

  async function updateTracks() {
    for (const [name, userPeers] of Object.entries(peers.current)) {
      for (const [streamType, pc] of Object.entries(userPeers)) {
        const senders = pc.getSenders();
        let localStream = null;

        if (streamType === "webcam") localStream = webcamStream.current;
        else if (streamType === "screen") localStream = screenStream.current;

        [micStream.current, localStream].forEach((stream) => {
          if (stream) {
            stream.getTracks().forEach(async (track) => {
              const sender = senders.find((s) => s.track?.kind === track.kind);
              if (sender) await sender.replaceTrack(track);
              else pc.addTrack(track, stream);
            });
          }
        });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal("offer", name, pc.localDescription, streamType);
      }
    }
  }

  function sendSignal(type, to, data, streamType = "webcam") {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          signal_type: type,
          signal_data: data,
          to,
          stream_type: streamType,
        })
      );
    }
  }

  function stopAllStreams() {
    [micStream.current, webcamStream.current, screenStream.current].forEach((s) => {
      if (s) s.getTracks().forEach((t) => t.stop());
    });
    setUserStreamsMap({});
    setActiveUser(null);
  }

  const toggleMic = async () => {
    if (micStream.current) {
      micStream.current.getTracks().forEach((t) => t.stop());
      micStream.current = null;
      setIsMicOn(false);
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStream.current = s;
        setIsMicOn(true);
      } catch (e) {
        console.error(e);
      }
    }
    await updateTracks();
  };

  const toggleWebcam = async () => {
    if (webcamStream.current) {
      webcamStream.current.getTracks().forEach((t) => t.stop());
      webcamStream.current = null;
      setIsWebcamOn(false);
      setUserStreamsMap((prev) => {
        const next = { ...prev };
        if (next[username]) {
          delete next[username].webcam;
          if (Object.keys(next[username]).length === 0) delete next[username];
        }
        return next;
      });
      setActiveUser((current) =>
        current?.username === username
          ? { ...current, webcamStream: null }
          : current
      );
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        webcamStream.current = s;
        subscribeTrackEnded(s, username, "webcam");
        setIsWebcamOn(true);
        setUserStreamsMap((prev) => ({
          ...prev,
          [username]: {
            ...(prev[username] || {}),
            webcam: s,
          },
        }));
      } catch (e) {
        console.error(e);
      }
    }
    await updateTracks();
  };

  const toggleScreenSharing = async () => {
    if (screenStream.current) {
      screenStream.current.getTracks().forEach((t) => t.stop());
      screenStream.current = null;
      setIsScreenSharing(false);
      setUserStreamsMap((prev) => {
        const next = { ...prev };
        if (next[username]) {
          delete next[username].screen;
          if (Object.keys(next[username]).length === 0) delete next[username];
        }
        return next;
      });
      setActiveUser((current) =>
        current?.username === username
          ? { ...current, screenStream: null }
          : current
      );
    } else {
      try {
        const s = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStream.current = s;
        subscribeTrackEnded(s, username, "screen");
        setIsScreenSharing(true);
        setUserStreamsMap((prev) => ({
          ...prev,
          [username]: {
            ...(prev[username] || {}),
            screen: s,
          },
        }));
      } catch (e) {
        console.error(e);
      }
    }
    await updateTracks();
  };

  const handleUserClick = (user) => {
    if (activeUser?.username === user) {
      setActiveUser(null);
    } else {
      setActiveUser({
        username: user,
        screenStream: userStreamsMap[user]?.screen || null,
        webcamStream: userStreamsMap[user]?.webcam || null,
      });
    }
  };

  const containerClass = panelVisible
    ? "center-content with-panel"
    : "center-content full-width";

  return (
    <div className={`${containerClass} ${isTranslating ? "translating" : ""}`}>
      {isTranslating ? (
        <div className="conference-view">
          <h2 className="conference-title">
            Добро пожаловать в канал:{" "}
            <span className="channel-name">"{channelName || `ID ${currentChannel}`}"</span>
          </h2>

          <div className="user-tiles-container">
            <UserTiles
              participants={participants}
              activeUser={activeUser?.username}
              onUserClick={handleUserClick}
              streams={userStreamsMap}
              username={username}
              isWebcamOn={isWebcamOn}
              webcamStream={webcamStream.current}
            />
          </div>
          <div className="user-stream-wrapper">
            {activeUser ? (
              <UserStreamView
                user={activeUser.username}
                screenStream={activeUser.screenStream}
                webcamStream={activeUser.webcamStream}
                onClose={() => setActiveUser(null)}
                isLocalUser={activeUser.username === username}
              />

            ) : (
              <div className="no-video-placeholder">
  <p className="no-video-text">Нажмите на<br />любого пользователя.</p>
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
