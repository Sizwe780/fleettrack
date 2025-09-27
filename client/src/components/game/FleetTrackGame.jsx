import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Session State
let session = {
  sessionId: `SIM-${Date.now()}`,
  status: "active",
  messages: [],
  score: 0
};

// Message Dispatcher
function dispatchMessage(sender, message) {
  const msg = {
    sender,
    message,
    timestamp: Date.now()
  };
  session.messages.push(msg);
  console.log(`\n📨 ${sender}: ${message}`);
}

// Game Round
function gameRound() {
  console.log("\n🚨 Incoming Message from Driver D-009:");
  console.log('"There\'s a protest blocking the main gate. I\'m stuck."');
  console.log("\nOptions:");
  console.log("1. Escalate to ProtectionUnit");
  console.log("2. Reroute via South Gate");
  console.log("3. Send AI reassurance message");

  rl.question("\nType your command (1-3): ", (answer) => {
    switch (answer.trim()) {
      case "1":
        dispatchMessage("FleetAI", "Incident escalated. ProtectionUnit dispatched.");
        session.score += 10;
        break;
      case "2":
        dispatchMessage("FleetAI", "Driver rerouted via South Gate.");
        session.score += 5;
        break;
      case "3":
        dispatchMessage("FleetAI", "Stay calm. Alternate route being calculated.");
        session.score += 3;
        break;
      default:
        console.log("❌ Invalid command. Try again.");
        return gameRound();
    }

    console.log(`\n✅ Score: ${session.score}`);
    nextRound();
  });
}

// Next Scenario
function nextRound() {
  console.log("\n🧠 FleetAI: Ready for next dispatch.");
  console.log("1. Continue");
  console.log("2. View Session Summary");
  console.log("3. Terminate Simulation");

  rl.question("\nChoose your action: ", (choice) => {
    switch (choice.trim()) {
      case "1":
        return gameRound();
      case "2":
        console.log("\n📋 Session Summary:");
        console.log(`Session ID: ${session.sessionId}`);
        console.log(`Status: ${session.status}`);
        console.log(`Messages: ${session.messages.length}`);
        console.log(`Score: ${session.score}`);
        return nextRound();
      case "3":
        session.status = "terminated";
        console.log("\n🛑 Simulation terminated. Final Score:", session.score);
        rl.close();
        break;
      default:
        console.log("❌ Invalid choice.");
        return nextRound();
    }
  });
}

// Start Game
console.log("🎮 FleetTrack Ops: Tactical Dispatch Simulation");
gameRound();