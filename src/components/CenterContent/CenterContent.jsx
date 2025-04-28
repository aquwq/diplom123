import React, { useState, useEffect, useRef } from "react";
import "./CenterContent.css";

export default function CenterContent({ isTranslating, onCloseTranslating, currentChannel }) {
  const videoRef = useRef(null);
  const webcamRef = useRef(null);
  const ws = useRef(null);
  const peers = useRef({});
  const screenStream = useRef(null);
  const webcamStream = useRef(null);
  const micStream = useRef(null);
  const token = localStorage.getItem("access");

  const [isMicOn, setIsMicOn] = useState(false);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

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
        msg.participants.forEach((name) => {
          if (!peers.current[name] && name !== currentChannel) {
            createPeer(name);
          }
        });
      }

      if (msg.type === "signal") {
        const { from, signal_type, signal_data } = msg;
        if (from === currentChannel) return; // Игнорировать сигналы самому себе

        const pc = peers.current[from];
        if (!pc) return console.warn("⚠️ No peer for", from);

        if (signal_type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(signal_data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal("answer", from, pc.localDescription);
        }

        if (signal_type === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(signal_data));
        }

        if (signal_type === "ice") {
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

  async function createPeer(name) {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal("ice", name, e.candidate.toJSON());
      }
    };

    pc.ontrack = (e) => {
      console.log("🎥 Remote track received from", name);
      if (videoRef.current && !videoRef.current.srcObject) {
        videoRef.current.srcObject = e.streams[0];
      }
    };

    peers.current[name] = pc;
    await addAllTracks(pc);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal("offer", name, pc.localDescription);
  }

  async function addAllTracks(pc) {
    const streams = [screenStream.current, webcamStream.current, micStream.current];
    streams.forEach((stream) => {
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

  async function updateTracks() {
    for (const [peerId, pc] of Object.entries(peers.current)) {
      const senders = pc.getSenders();
      const streams = [screenStream.current, webcamStream.current, micStream.current];

      for (const stream of streams) {
        if (stream) {
          for (const track of stream.getTracks()) {
            let sender = senders.find((s) => s.track?.kind === track.kind);
            if (sender) {
              await sender.replaceTrack(track);
            } else {
              pc.addTrack(track, stream);
            }
          }
        }
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal("offer", peerId, pc.localDescription);
    }
  }

  function sendSignal(signalType, to, data) {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          signal_type: signalType,
          signal_data: data,
          to: to,
        })
      );
    }
  }

  async function toggleMic() {
    if (isMicOn) {
      stopStream(micStream.current);
      micStream.current = null;
      setIsMicOn(false);
      await updateTracks();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStream.current = stream;
        setIsMicOn(true);
        await updateTracks();
      } catch (err) {
        console.error("❌ Microphone capture failed:", err);
      }
    }
  }

  async function toggleWebcam() {
    if (isWebcamOn) {
      stopStream(webcamStream.current);
      webcamStream.current = null;
      setIsWebcamOn(false);
      webcamRef.current && (webcamRef.current.srcObject = null);
      await updateTracks();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcamStream.current = stream;
        webcamRef.current && (webcamRef.current.srcObject = stream);
        setIsWebcamOn(true);
        await updateTracks();
      } catch (err) {
        console.error("❌ Webcam capture failed:", err);
      }
    }
  }

  async function startScreenShare() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      stopStream(screenStream.current);
      screenStream.current = stream;
      setIsScreenSharing(true);
      videoRef.current && (videoRef.current.srcObject = stream);
      await updateTracks();
    } catch (err) {
      console.error("❌ Screen sharing failed:", err);
    }
  }

  function stopStream(stream) {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }

  function stopAllStreams() {
    stopStream(screenStream.current);
    stopStream(webcamStream.current);
    stopStream(micStream.current);
    screenStream.current = null;
    webcamStream.current = null;
    micStream.current = null;
  }

  return (
    <div className="center-content">
      {isTranslating ? (
        <div className="conference-view">
          <h2 className="conference-title">Трансляция канала "{currentChannel}"</h2>

          <div className="conference-video">
            <video ref={videoRef} autoPlay playsInline muted />
          </div>

          <div className="conference-webcam">
            <video ref={webcamRef} autoPlay playsInline muted />
          </div>

          <div className="conference-functions">
            <button className="screen-button" onClick={startScreenShare}>
              Показать свой экран
            </button>
            <button className="mic-button" onClick={toggleMic}>
              {isMicOn ? "Выключить микрофон" : "Включить микрофон"}
            </button>
            <button className="webcam-button" onClick={toggleWebcam}>
              {isWebcamOn ? "Выключить вебку" : "Включить вебку"}
            </button>
          </div>

          <button className="back-button" onClick={onCloseTranslating}>
            НА ГЛАВНУЮ
          </button>
        </div>
      ) : (
        <h1>NorVoice</h1>
      )}
    </div>
  );
}
