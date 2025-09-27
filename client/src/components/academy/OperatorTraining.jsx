// OperatorTraining.jsx

import { useState } from "react";
import {
  dispatchMessage,
  interpretChoice,
  getSessionSummary,
  terminateSession
} from "../Eninge/GameEngine";

const trainingScenarios = [
  {
    id: "S1",
    message: "Driver D-101 reports: 'I see smoke near the east gate.'",
    options: [
      { label: "Escalate to ProtectionUnit", value: "1" },
      { label: "Send AI reassurance", value: "3" },
      { label: "Ignore", value: "0" }
    ]
  },
  {
    id: "S2",
    message: "Driver D-202: 'Traffic jam on main route. ETA delayed.'",
    options: [
      { label: "Reroute via alternate path", value: "2" },
      { label: "Send AI reassurance", value: "3" },
      { label: "Ignore", value: "0" }
    ]
  }
];

export default function OperatorTraining() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("training");

  const currentScenario = trainingScenarios[scenarioIndex];

  const handleChoice = (value) => {
    if (value === "0") {
      setMessages(prev => [...prev, { sender: "FleetAI", message: "No action taken." }]);
    } else {
      const response = interpretChoice(value);
      const msg = dispatchMessage("FleetAI", response);
      setMessages(prev => [...prev, msg]);
      setScore(getSessionSummary().score);
    }

    if (scenarioIndex + 1 < trainingScenarios.length) {
      setScenarioIndex(scenarioIndex + 1);
    } else {
      setStatus("completed");
      terminateSession();
    }
  };

  return (
    <div className="training-ui">
      <h2>🎓 Operator Academy</h2>
      <p>Status: <strong>{status}</strong></p>

      {status === "training" && (
        <>
          <div className="scenario">
            <p>🧠 Scenario {currentScenario.id}:</p>
            <blockquote>{currentScenario.message}</blockquote>
          </div>

          <div className="options">
            {currentScenario.options.map((opt, i) => (
              <button key={i} onClick={() => handleChoice(opt.value)}>{opt.label}</button>
            ))}
          </div>
        </>
      )}

      {status === "completed" && (
        <div className="summary">
          <h3>✅ Training Complete</h3>
          <p>Final Score: {score}</p>
          <ul>
            {messages.map((msg, i) => (
              <li key={i}>{msg.sender}: {msg.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}