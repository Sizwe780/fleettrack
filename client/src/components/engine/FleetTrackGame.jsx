import React, { useState } from "react";
import GameEngine from "./GameEngine"; // ✅ Corrected path

export default function FleetTrackGame() {
  const [messages, setMessages] = useState([]);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("active");

  const handleCommand = (choice) => {
    const response = GameEngine.interpretChoice(choice);
    const msg = GameEngine.dispatchMessage("FleetAI", response);
    setMessages(prev => [...prev, msg]);
    setScore(GameEngine.getSessionSummary().score);
  };

  const handleTerminate = () => {
    const terminated = GameEngine.terminateSession();
    setStatus(terminated.status);
  };

  return (
    <div className="game-ui">
      <h2>🕹️ FleetTrack Ops</h2>
      <p>Status: <strong>{status}</strong></p>

      <div className="scenario">
        <p>🚨 Message from Driver D-009:</p>
        <blockquote>"There's a protest blocking the main gate. I'm stuck."</blockquote>
      </div>

      <div className="options">
        <button onClick={() => handleCommand("1")}>🔺 Escalate</button>
        <button onClick={() => handleCommand("2")}>🛣️ Reroute</button>
        <button onClick={() => handleCommand("3")}>🤖 Reassure</button>
      </div>

      <div className="log">
        <h3>📨 Dispatch Log</h3>
        <ul>
          {messages.map((msg, i) => (
            <li key={i}>{msg.sender}: {msg.message}</li>
          ))}
        </ul>
        <p>✅ Score: {score}</p>
      </div>

      <div className="controls">
        <button onClick={handleTerminate}>🛑 Terminate Simulation</button>
      </div>
    </div>
  );
}