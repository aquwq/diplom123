import React from "react";
import "./ParticipantsList.css";

function ParticipantsList({ participants }) {
  return (
    <div className="participants-container">
      <ul className="participants-list">
        {participants.map((participant, index) => (
          <li key={index}>{participant}</li>
        ))}
      </ul>
    </div>
  );
}

export default ParticipantsList;
