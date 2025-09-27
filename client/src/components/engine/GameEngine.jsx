let sessionScore = 0;
let sessionActive = true;

export function interpretChoice(choice) {
  switch (choice) {
    case "1":
      sessionScore += 10;
      return "ProtectionUnit dispatched to secure perimeter.";
    case "2":
      sessionScore += 7;
      return "Rerouting driver via South Gate.";
    case "3":
      sessionScore += 5;
      return "Reassurance message sent to driver.";
    default:
      return "Invalid command.";
  }
}

export function dispatchMessage(sender, message) {
  return { sender, message };
}

export function getSessionSummary() {
  return { score: sessionScore, status: sessionActive ? "active" : "terminated" };
}

export function terminateSession() {
  sessionActive = false;
  return { status: "terminated", summary: getSessionSummary() };
}

// ✅ Default export wrapper for compatibility
const GameEngine = {
  dispatchMessage,
  interpretChoice,
  getSessionSummary,
  terminateSession
};

export default GameEngine;